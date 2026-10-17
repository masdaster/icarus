package main

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gonutz/w32/v2"
	"github.com/jmoiron/jsonq"
)

const LATEST_RELEASE_URL = "https://api.github.com/repos/EDDataAPI/eddata-icarus/releases/latest"

type Release struct {
	InstalledVersion string `json:"installedVersion"`
	ProductVersion   string `json:"productVersion"`
	DownloadUrl      string `json:"downloadUrl"`
	ReleaseNotes     string `json:"releaseNotes"`
	IsUpgrade        bool   `json:"isUpgrade"`
}

// compareVersions compares two semver version strings
// Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
func compareVersions(v1, v2 string) int {
	parts1 := strings.Split(v1, ".")
	parts2 := strings.Split(v2, ".")

	// Pad shorter version with zeros
	maxLen := len(parts1)
	if len(parts2) > maxLen {
		maxLen = len(parts2)
	}

	for len(parts1) < maxLen {
		parts1 = append(parts1, "0")
	}
	for len(parts2) < maxLen {
		parts2 = append(parts2, "0")
	}

	// Compare each part
	for i := 0; i < maxLen; i++ {
		n1, _ := strconv.Atoi(parts1[i])
		n2, _ := strconv.Atoi(parts2[i])

		if n1 > n2 {
			return 1
		}
		if n1 < n2 {
			return -1
		}
	}

	return 0
}

func CheckForUpdate() (bool, error) {
	latestUpdate, err := GetLatestRelease()
	if err != nil {
		return false, err
	}

	return latestUpdate.IsUpgrade, nil
}

func InstallUpdate() {
	release, err := GetLatestRelease()
	if err == nil {
		pathToFile, _ := DownloadUpdate(release.DownloadUrl)
		runElevated(pathToFile)
		os.Exit(0)
	}
}

func GetCurrentAppVersion() string {
	pathToExecutable, err := os.Executable()
	if err != nil {
		panic("os.Executable() failed")
	}

	size := w32.GetFileVersionInfoSize(pathToExecutable)
	if size <= 0 {
		panic("GetFileVersionInfoSize failed")
	}

	info := make([]byte, size)
	ok := w32.GetFileVersionInfo(pathToExecutable, info)
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

func GetLatestRelease() (Release, error) {
	releasesUrl := LATEST_RELEASE_URL
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

	body, readErr := io.ReadAll(res.Body)
	if readErr != nil {
		return release, readErr
	}

	jsonObjectAsString := string(body)

	// Use jsonq to access JSON
	data := map[string]interface{}{}
	dec := json.NewDecoder(strings.NewReader(jsonObjectAsString))
	dec.Decode(&data)
	jq := jsonq.NewQuery(data)

	// Get properties from from JSON
	tag, _ := jq.String("tag_name")
	productVersion := regexp.MustCompile(`^v`).ReplaceAllString(tag, ``) // Converts tag (v0.0.0) to semver version (0.0.0) for easier comparion
	downloadUrl, _ := jq.String("assets", "0", "browser_download_url")
	releaseNotes, _ := jq.String("body")

	if downloadUrl == "" {
		return release, errors.New("could not get download URL")
	}

	installedVersion := GetCurrentAppVersion()

	release.InstalledVersion = installedVersion
	release.ProductVersion = productVersion
	release.DownloadUrl = downloadUrl
	release.ReleaseNotes = releaseNotes
	release.IsUpgrade = compareVersions(productVersion, installedVersion) > 0

	return release, nil
}

func DownloadUpdate(downloadUrl string) (string, error) {
	tmpDir, err := os.MkdirTemp("", "*")
	if err != nil {
		return "", err
	}
	tmpfile := filepath.Join(tmpDir, "EDData-Icarus Update.exe")

	// Get file to download
	resp, err := http.Get(downloadUrl)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Create file
	out, err := os.Create(tmpfile)
	if err != nil {
		return "", err
	}
	defer out.Close()

	// Write to file
	if _, err = io.Copy(out, resp.Body); err != nil {
		return "", err
	}

	return tmpfile, nil
}
