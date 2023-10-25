### About

This project will download the entire git history for a repository (contributors, contributions, etc) into an excel sheet.  For recruiters / sourcers out there, this means emails for every person that contributed to a repo, as well as metadata about everything that they contributed (what and when).

Here's a quick youtube demo: https://youtu.be/iug0oSKU_H0?feature=shared

I made this awhile back and have decided to share this freely via a GPL v3 license.  For what it's worth, this is the secret sauce to a popular sourcing platform for finding engineers that companies spend thousands of dollars a month on.  Here it is free.

### Installation

There are two ways to install the extension.

Option 1: Through the Chrome webstore (easiest):
https://chrome.google.com/webstore/detail/git-by-native-extensions/hmkflfcoeccgkgignhfpbhnbjkjgembm?hl=en&authuser=0

Option 2: Directly from this source code (also easy)
  * enter chrome:extensions in the browser URL bar
  * make sure developer mode in the top right corner is on
  * hit the load unpacked button and select the `chrome` here directory (any other selection will fail)

### Usage

Once the extension is installed, go to any repo and hit the extension icon in the top right corner.  The extension will start to process the entire git history directly in your browser, then download an excel sheet with everything from it when it's done.  Keep in mind that larger repos will take longer than smaller ones to download, but a download will come.

### Sharing and modification

If this is useful to you, share it with others.

If you'd like to make changes to the software, go for it.  The full source code is included.
