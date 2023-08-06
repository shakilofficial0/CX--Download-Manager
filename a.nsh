!macro customHeader
    RequestExecutionLevel admin
!macroend

!macro customInstall
SetRegView 64
!define PRODUCT_UNINST_KEY "Software\Google\Chrome\NativeMessagingHosts\com.codebumble.cyberxplusdownloadmanager"
WriteRegStr HKCU "${PRODUCT_UNINST_KEY}"  "" "$INSTDIR\native-action.json"
!macroend