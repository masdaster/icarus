package main

import (
	"strings"
	"encoding/json"
	"github.com/jmoiron/jsonq"
	"github.com/sqweek/dialog"
	"github.com/gonutz/w32/v2"
	"io/ioutil"
	"net/http"
	"time"
	"regexp"
	"os/exec"
	"errors"
	"io"
	"os"
)

const LATEST_RELEASE_URL = "https://api.github.com/repos/iaincollins/icarus/releases/latest"

type Release struct {
	productVersion string
	downloadUrl string
}

func CheckForUpdate() {
	currentProductVersion := GetCurrentAppVersion()
	release, releaseErr := GetLatestRelease(LATEST_RELEASE_URL)
	if releaseErr != nil {
		return
	}

	// If we are already running the latest release, do nothing
	if (currentProductVersion == release.productVersion) {
		return
	}

	ok := dialog.Message("%s", "A new version of ICARUS Terminal is available.\n\nWould you like to download the update?").Title("New version available").YesNo()
	if (ok) {
		downloadUrl := release.downloadUrl // In future may redirect to webpage instead 
		exec.Command("rundll32", "url.dll,FileProtocolHandler", downloadUrl).Start()
		
		// This is disabled as we can't actually run the current installer this way
		// because it requires escalated privilages. This could be addressed by
		// using a different type of installer.
		/*
		downloadedFile, downloadErr := DownloadRelease(release)
		if downloadErr != nil {
			fmt.Println("Error downloading update", downloadErr.Error())
		}

		installerCmdInstance := exec.Command(downloadedFile)
		installerCmdErr := installerCmdInstance.Start()
		if installerCmdErr != nil {
			fmt.Println("Error installing update", installerCmdErr.Error())
		}
		*/
	}

	return
}

func GetCurrentAppVersion() string {
	const path = "ICARUS Terminal.exe"

	size := w32.GetFileVersionInfoSize(path)
	if size <= 0 {
			panic("GetFileVersionInfoSize failed")
	}

	info := make([]byte, size)
	ok := w32.GetFileVersionInfo(path, info)
	if !ok {
			panic("GetFileVersionInfo failed")
	}

	/*
	fixed, ok := w32.VerQueryValueRoot(info)
	if !ok {
			panic("VerQueryValueRoot failed")
	}
	version := fixed.FileVersion()
	fileVersion := fmt.Sprintf(
			"%d.%d.%d.%d",
			version&0xFFFF000000000000>>48,
			version&0x0000FFFF00000000>>32,
			version&0x00000000FFFF0000>>16,
			version&0x000000000000FFFF>>0,
	)
	*/

	translations, ok := w32.VerQueryValueTranslations(info)
	if !ok {
		panic("VerQueryValueTranslations failed")
	}
	if len(translations) == 0 {
		panic("no translation found")
	}
	t := translations[0]

	productVersion, ok := w32.VerQueryValueString(info, t, w32.ProductVersion)
	if !ok {
		panic("cannot get product version")
	}

	// Convert from version with build number (0.0.0.0) to semver version (0.0.0)
	productVersion = regexp.MustCompile(`(\.[^\.]+)$`).ReplaceAllString(productVersion, ``)

	return productVersion
}

func GetLatestRelease(releasesUrl string) (Release, error) {
	release := Release{}

	httpClient := http.Client{Timeout: time.Second * 5}

	req, reqErr := http.NewRequest(http.MethodGet, releasesUrl, nil)
	if reqErr != nil {
		return release, reqErr
	}

	res, getErr := httpClient.Do(req)
	if getErr != nil {
		return release, getErr
	}

	if res.Body != nil {
		defer res.Body.Close()
	}

	body, readErr := ioutil.ReadAll(res.Body)
	if readErr != nil {
		return release, readErr
	}

	// Hackery to convert the response into JSON that jsonq can parse
	jsonObjectAsString := string(body)
	// jsonObjectAsString = regexp.MustCompile(`^\[`).ReplaceAllString(jsonObjectAsString, `{"releases":[`)
	// jsonObjectAsString = regexp.MustCompile(`\]$`).ReplaceAllString(jsonObjectAsString, `]}`)

	// Use jsonq to access JSON 
	data := map[string]interface{}{}
	dec := json.NewDecoder(strings.NewReader(jsonObjectAsString))
	dec.Decode(&data)
	jq := jsonq.NewQuery(data)

	// Get properties from from JSON
	// tag, _ := jq.String("releases", "0", "tag_name")
	// productVersion := regexp.MustCompile(`^v`).ReplaceAllString(tag, ``)
	// downloadUrl, _ := jq.String("releases", "0", "assets", "0", "browser_download_url")
	tag, _ := jq.String("tag_name")
	productVersion := regexp.MustCompile(`^v`).ReplaceAllString(tag, ``) // Converts tag (v0.0.0) to semver version (0.0.0) for easier comparion
	downloadUrl, _ := jq.String("assets", "0", "browser_download_url")

	if (downloadUrl == "") {
		return release, errors.New("Could not get download URL")
	}

	release.productVersion = productVersion
	release.downloadUrl = downloadUrl

	return release, nil
}

func DownloadRelease(release Release) (string, error) {
	pathToDownloadedFile := "ICARUS Update.exe"

	// Get file to download
	resp, err := http.Get(release.downloadUrl)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Create file
	out, err := os.Create(pathToDownloadedFile)
	if err != nil {
		return "", err
	}
	defer out.Close()

	// Write to file
	_, err = io.Copy(out, resp.Body)

	return pathToDownloadedFile, nil
}