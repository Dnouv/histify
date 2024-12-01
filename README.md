# Histify: Your Smart Browser History Assistant

## Overview
This project is a Chrome extension named **Histify**. A powerful Chrome extension, transforms your browser history into an intelligent and searchable assistant. Built on top of the **Gemini Nano** model, Histify allows you to query your browser history in natural language and get the most relevant answers. The extension is designed to be user-friendly and intuitive, providing a seamless experience for users to interact with their browser history.

## Project Structure
[structure.md](structure.md)

## Getting Started

### System Requirements
> **Note**: Chrome Version 128.0.6545.0 or above for desktop. For best compatibility download Chrome Canary or Dev.

| Requirement | Windows | macOS | Linux |
|------------|---------|--------|--------|
| OS Version | 10, 11 | ≥ 13 (Ventura) | Not specified |
| Storage | 22 GB+ | 22 GB+ | 22 GB+ |
| GPU | Integrated or discrete | Integrated or discrete | Integrated or discrete |
| Video RAM | 4 GB (minimum) | 4 GB (minimum) | 4 GB (minimum) |
| Network | Non-metered connection | Non-metered connection | Non-metered connection |

Source: [Chrome Browser System Requirements](https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit?tab=t.0)

> **Note**: Storage requirement ensures ample margin for Chrome profile. Model requires significantly less space. If available storage falls below 10 GB post-download, model will be removed.


### Setup

1. In the browser, type the in the URL: [`chrome://flags/#text-safety-classifier`](chrome://flags/#text-safety-classifier) and select "Disabled" from the dropdown. Disabling this flag will prevent the AI generated answers from being blocked by the text safety classifier.
> **Note**: This flag is only available in Chrome Canary or Dev.
2. Open a new tab in Chrome, go to [`chrome://flags/#optimization-guide-on-device-model`](chrome://flags/#optimization-guide-on-device-model) and select "Select Enabled BypassPerfRequirement" from the dropdown.
This bypass performance checks which might get in the way of having Gemini Nano downloaded on your device.
> **Note**: If you don't see BypassPerfRequirement in the dropdown, you can try "Enabled" instead.
3. Go to [`chrome://flags/#prompt-api-for-gemini-nano`](chrome://flags/#prompt-api-for-gemini-nano) and select "Enabled" from the dropdown.
4. Relaunch Chrome.
5. Go to [`chrome://components`](chrome://components), if you see `Optimization Guide On Device Model - Version: 2024.9.25.2033
` then you are good to go. If not, click "Check for Update" on "Optimization Guide On Device Model". And wait for the update to complete.
6. Go to [`chrome://extensions`](chrome://extensions) and enable "Developer mode" at the top right.

### Installation
1. Download the extension crx file from the [releases directory](releases/).
2. Drag and drop the crx file into the Chrome extensions page ([`chrome://extensions`](chrome://extensions)).
3. Click "Add extension" when prompted.
4. Accept the permissions requested by the extension.
5. If there any warnings, click "Keep" to proceed with the installation.

#### [Optional] Install from Source
1. Clone the repository.
2. Go to [`chrome://extensions`](chrome://extensions) and enable "Developer mode" at the top right.
3. Click "Load unpacked" and select the `build` directory from the cloned repository.

### Usage
- Visit any website like you normally would.
- Wait a few seconds for the extension to process the page.
- Visit as many websites as you like.

Now to query your history in natural language, click on the extension icon in the top right corner of the browser and a side panel will open up. You can type in your query in the search bar and the extension will show you the most relevant pages from your history. Or ask a question in natural language and the extension will provide you with the most relevant answer from your history.

### Upcoming Features
- [ ] Support for more languages.
- [ ] Support for more browsers.
- [ ] Support more LLM models.
- [ ] Support for vectorized search.


## License
This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.