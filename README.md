### NodeCode v1.3.0

> Uses Tauri, Next JS, Rusqlite, and Tailwind CSS

### Development
```bash
### clone the repo
git clone https://github.com/nodecodeapp/NodeCodeDesktop.git -b dev

### change directory
cd NodeCodeDesktop

### install dependencies
npm install

### run the app
npm run tauri dev
```

### Build
```bash
### build frontend
npm run build
### build the app
npm run tauri build
```


<!-- apple key -->
<!-- 
Key steps:
Join Apple Developer Program:
You need to enroll in the Apple Developer Program to access the necessary tools for creating signing certificates. 
Access Developer Portal:
Log in to your Apple Developer account on the developer portal. 
Navigate to Certificates, Identifiers & Profiles:
Go to the section where you can manage certificates and profiles for your developer account. 
Create a Certificate Signing Request (CSR):
Use Keychain Access on your Mac to generate a CSR, which is a request to Apple to issue a code signing certificate for you. 
Select "Developer ID" certificate type:
When creating a new certificate, choose the "Developer ID" option to generate a certificate specifically for signing macOS applications. 
Download the certificate:
Once Apple issues the certificate based on your CSR, download it to your Mac. 
Import into Xcode:
In Xcode, go to your project settings and import the downloaded certificate to use it for code signing your .dmg file. 
Important points to remember:
Account Holder Access:
To create a Developer ID certificate, you need to be the Account Holder of your development team. 
Code Signing in Xcode:
Once you have the certificate, you can use Xcode's code signing features to sign your .dmg file with the appropriate settings. 
Notarization:
For increased security, consider notarizing your signed .dmg file through Apple's notarization service after signing it. 
 -->