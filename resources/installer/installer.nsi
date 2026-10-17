!define APP_NAME "EDData-ICARUS"
!define COMP_NAME "EDData"
!define VERSION "${PRODUCT_VERSION}"
!define COPYRIGHT "EDData"
!define DESCRIPTION "Companion App for Elite Dangerous"
!define INSTALLER_NAME "../../dist/EDData-ICARUS Setup.exe"
!define APP_EXE "EDData-ICARUS.exe"
!define SERVICE_EXE "EDData-ICARUS Service.exe"
!define INSTALL_TYPE "SetShellVarContext current"
!define REG_ROOT "HKCU"
!define REG_APP_PATH "Software\Microsoft\Windows\CurrentVersion\App Paths\${APP_EXE}"
!define UNINSTALL_PATH "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"

; License file
!define LICENSE_TXT "..\..\LICENSE.md"

; Start menu folder
!define REG_START_MENU "Start Menu Folder"
Var SM_Folder

######################################################################

VIProductVersion  "${VERSION}"
VIAddVersionKey "ProductName"  "${APP_NAME}"
VIAddVersionKey "CompanyName"  "${COMP_NAME}"
VIAddVersionKey "LegalCopyright"  "${COPYRIGHT}"
VIAddVersionKey "FileDescription"  "${DESCRIPTION}"
VIAddVersionKey "FileVersion"  "${VERSION}"

######################################################################

SetCompressor ZLIB
Name "${APP_NAME}"
Caption "${APP_NAME}"
OutFile "${INSTALLER_NAME}"
BrandingText "${APP_NAME}"
XPStyle on
InstallDirRegKey "${REG_ROOT}" "${REG_APP_PATH}" ""
InstallDir "$PROGRAMFILES\${APP_NAME}"

######################################################################

!include "MUI.nsh"
!include "webview2.nsh"

!addplugindir "./"

!define MUI_ABORTWARNING
!define MUI_UNABORTWARNING

!define MUI_WELCOMEFINISHPAGE_BITMAP "panel.bmp"  # 164x314px
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_RIGHT
!define MUI_HEADERIMAGE_BITMAP "header.bmp" # 150x57px

!insertmacro MUI_PAGE_WELCOME

!ifdef LICENSE_TXT
!insertmacro MUI_PAGE_LICENSE "${LICENSE_TXT}"
!endif

; Directory selection page
!insertmacro MUI_PAGE_DIRECTORY

!ifdef REG_START_MENU
!define MUI_STARTMENUPAGE_NODISABLE
!define MUI_STARTMENUPAGE_DEFAULTFOLDER "${APP_NAME}"
!define MUI_STARTMENUPAGE_REGISTRY_ROOT "${REG_ROOT}"
!define MUI_STARTMENUPAGE_REGISTRY_KEY "${UNINSTALL_PATH}"
!define MUI_STARTMENUPAGE_REGISTRY_VALUENAME "${REG_START_MENU}"
!insertmacro MUI_PAGE_STARTMENU Application $SM_Folder
!endif

!insertmacro MUI_PAGE_INSTFILES

# Pass the flag "--install" to let the app know it is being run by the installer
# after install/update as an easy way to trigger any 'first run' actions.
# There are better ways to do this, but it's much easier to do it this way.
!define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_EXE}"
!define MUI_FINISHPAGE_RUN_PARAMETERS "--install"
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM

!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

######################################################################

# String search function for language-independent process detection
Function StrStr
  Exch $R1 # needle
  Exch
  Exch $R2 # haystack
  Push $R3
  Push $R4
  Push $R5
  StrLen $R3 $R1
  StrCpy $R4 0
  loop:
    StrCpy $R5 $R2 $R3 $R4
    StrCmp $R5 $R1 done
    StrCmp $R5 "" done
    IntOp $R4 $R4 + 1
    Goto loop
  done:
    StrCpy $R1 $R5
    Pop $R5
    Pop $R4
    Pop $R3
    Pop $R2
    Exch $R1
FunctionEnd

######################################################################

# Check if application is running before install
Function .onInit
	# Check for existing installation
	ReadRegStr $0 ${REG_ROOT} "${UNINSTALL_PATH}" "InstallLocation"
	StrCmp $0 "" noExistingInstall
		# Existing installation found - set install directory to previous location
		StrCpy $INSTDIR $0
		MessageBox MB_YESNO|MB_ICONQUESTION \
			"${APP_NAME} is already installed in:$\n$\n$0$\n$\nDo you want to upgrade the existing installation?" \
			/SD IDYES IDYES checkRunning
		# User chose No - let them choose a different directory
		Goto checkRunning

	noExistingInstall:

	checkRunning:
	# Check if EDData Icarus is running
	FindWindow $0 "" "${APP_NAME}"
	StrCmp $0 0 checkService
		MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
			"${APP_NAME} is currently running. Please close it before continuing." \
			/SD IDCANCEL IDOK checkService
		Abort

	checkService:
	# Check if EDData-ICARUS Service is running (language-independent check)
	nsExec::ExecToStack 'tasklist /FI "IMAGENAME eq ${SERVICE_EXE}" /NH'
	Pop $0
	Pop $1
	# If the process is running, its name will appear in the output
	# If not running, output will be an error/info message without the process name
	Push $1
	Push "${SERVICE_EXE}"
	Call StrStr
	Pop $2
	StrCmp $2 "" done
		# Process name found in output - process is running
		MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
			"${SERVICE_EXE} is currently running. Please close ${APP_NAME} before continuing." \
			/SD IDCANCEL IDOK done
		Abort

	done:
FunctionEnd

######################################################################

Section -MainProgram
${INSTALL_TYPE}
SetOverwrite ifnewer
SetOutPath "$INSTDIR"
File "..\..\build\bin\${SERVICE_EXE}"
File "..\..\build\bin\${APP_EXE}"
File "..\..\build\bin\WebView2Loader.dll"
File "..\..\build\bin\icon.ico"

; Install client files (Next.js build output)
SetOutPath "$INSTDIR\client"
File /r "..\..\build\client\*.*"

; Install service data files
SetOutPath "$INSTDIR\data"
File /r "..\..\build\bin\data\*.*"

Call installWebView2
SectionEnd

######################################################################

Section -Icons_Reg
SetOutPath "$INSTDIR"
WriteUninstaller "$INSTDIR\uninstall.exe"

!ifdef REG_START_MENU
!insertmacro MUI_STARTMENU_WRITE_BEGIN Application
CreateDirectory "$SMPROGRAMS\$SM_Folder"
	CreateShortCut "$SMPROGRAMS\$SM_Folder\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}"
	CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}"
!ifdef WEB_SITE
WriteIniStr "$INSTDIR\${APP_NAME} website.url" "InternetShortcut" "URL" "${WEB_SITE}"
CreateShortCut "$SMPROGRAMS\$SM_Folder\${APP_NAME} Website.lnk" "$INSTDIR\${APP_NAME} website.url"
!endif
!insertmacro MUI_STARTMENU_WRITE_END
!endif

!ifndef REG_START_MENU
CreateDirectory "$SMPROGRAMS\${APP_NAME}"
	CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}"
	CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}"
!ifdef WEB_SITE
WriteIniStr "$INSTDIR\${APP_NAME} website.url" "InternetShortcut" "URL" "${WEB_SITE}"
CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME} Website.lnk" "$INSTDIR\${APP_NAME} website.url"
!endif
!endif

	WriteRegStr ${REG_ROOT} "${REG_APP_PATH}" "" "$INSTDIR\${APP_EXE}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "DisplayName" "${APP_NAME}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "UninstallString" "$INSTDIR\uninstall.exe"
	WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "DisplayIcon" "$INSTDIR\${APP_EXE}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "DisplayVersion" "${VERSION}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "Publisher" "${COMP_NAME}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "InstallLocation" "$INSTDIR"
WriteRegDWORD ${REG_ROOT} "${UNINSTALL_PATH}" "NoModify" 1
WriteRegDWORD ${REG_ROOT} "${UNINSTALL_PATH}" "NoRepair" 1

!ifdef WEB_SITE
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "URLInfoAbout" "${WEB_SITE}"
!endif
SectionEnd

######################################################################

Section Uninstall
${INSTALL_TYPE}

# Terminate running processes
DetailPrint "Checking for running processes..."
	nsExec::ExecToLog 'taskkill /F /IM "${APP_EXE}" /T'
nsExec::ExecToLog 'taskkill /F /IM "${SERVICE_EXE}" /T'
Sleep 1000

# Delete files
Delete "$INSTDIR\${SERVICE_EXE}"
Delete "$INSTDIR\${APP_EXE}"
Delete "$INSTDIR\WebView2Loader.dll"
Delete "$INSTDIR\icon.ico"
Delete "$INSTDIR\uninstall.exe"
!ifdef WEB_SITE
Delete "$INSTDIR\${APP_NAME} website.url"
!endif

; Delete client directory
RmDir /r "$INSTDIR\client"

; Delete service data directory
RmDir /r "$INSTDIR\data"

RmDir "$INSTDIR"

!ifdef REG_START_MENU
!insertmacro MUI_STARTMENU_GETFOLDER "Application" $SM_Folder
Delete "$SMPROGRAMS\$SM_Folder\${APP_NAME}.lnk"
!ifdef WEB_SITE
Delete "$SMPROGRAMS\$SM_Folder\${APP_NAME} Website.lnk"
!endif
Delete "$DESKTOP\${APP_NAME}.lnk"

RmDir "$SMPROGRAMS\$SM_Folder"
!endif

!ifndef REG_START_MENU
Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
!ifdef WEB_SITE
Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME} Website.lnk"
!endif
Delete "$DESKTOP\${APP_NAME}.lnk"

RmDir "$SMPROGRAMS\${APP_NAME}"
!endif

DeleteRegKey ${REG_ROOT} "${REG_APP_PATH}"
DeleteRegKey ${REG_ROOT} "${UNINSTALL_PATH}"
SectionEnd

######################################################################

