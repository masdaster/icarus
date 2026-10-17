# From https://gist.github.com/jhandley/1ec569242170454c593a3b1642cc995e
# Updated to check both 32-bit and 64-bit registry paths

# Install webview2 by launching the bootstrapper
# See https://docs.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution#online-only-deployment
Function installWebView2

	# Check 64-bit registry path first (native on 64-bit systems)
	ReadRegStr $0 HKLM \
		"SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" "pv"

	# If not found in 64-bit, check 32-bit path (WOW6432Node)
	${If} ${Errors}
	${OrIf} $0 == ""
		ClearErrors
		ReadRegStr $0 HKLM \
			"SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" "pv"
	${EndIf}

	# If still not found, install WebView2
	${If} ${Errors}
	${OrIf} $0 == ""

		SetDetailsPrint both
		DetailPrint "Installing: WebView2 Runtime"
		SetDetailsPrint listonly

		InitPluginsDir
		CreateDirectory "$pluginsdir"
		SetOutPath "$pluginsdir"
		File "MicrosoftEdgeWebview2Setup.exe"

		# Install with error checking
		ExecWait '"$pluginsdir\MicrosoftEdgeWebview2Setup.exe" /silent /install' $1

		${If} $1 != 0
			DetailPrint "WebView2 installation returned code: $1"
			# Continue anyway - the bundled WebView2Loader.dll will handle fallback
		${EndIf}

		SetDetailsPrint both

	${Else}
		DetailPrint "WebView2 Runtime already installed (version $0)"
	${EndIf}

FunctionEnd
