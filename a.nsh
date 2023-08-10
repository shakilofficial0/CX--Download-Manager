!macro customHeader
    RequestExecutionLevel admin
!macroend

!macro customInstall
SetRegView 64
!define PRODUCT_UNINST_KEY "Software\Google\Chrome\NativeMessagingHosts\com.codebumble.cyberxplusdownloadmanager"
WriteRegStr HKCU "${PRODUCT_UNINST_KEY}"  "" "$INSTDIR\native-action-c.json"
WriteRegStr HKLM "${PRODUCT_UNINST_KEY}"  "" "$INSTDIR\native-action-c.json"
!define PRODUCT_UNINST_KEY_F "Software\Mozilla\NativeMessagingHosts\com.codebumble.cyberxplusdownloadmanager"
WriteRegStr HKCU "${PRODUCT_UNINST_KEY_F}"  "" "$INSTDIR\native-action-f.json"
WriteRegStr HKLM "${PRODUCT_UNINST_KEY_F}"  "" "$INSTDIR\native-action-f.json"
!macroend