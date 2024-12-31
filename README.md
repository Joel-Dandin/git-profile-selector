# Git Profile Switcher

## Overview

Git Profile Switcher is a desktop application that allows users to easily switch between different GitHub profiles. This is particularly useful for developers who manage multiple GitHub accounts for different projects or organizations.

## Features

- **Profile Management**: Create, update, and delete GitHub profiles.
- **Profile Switching**: Quickly switch between different GitHub profiles.
- **Configuration Management**: View and edit the current Git configuration.
- **Encryption**: Securely store profile information with encryption.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/)
- [Tauri](https://tauri.app/)

### Installation

1. Clone the repository:

```sh
git clone https://github.com/Joel-Dandin/git-profile-selector.git
cd git-profile-switcher
```

2. Install dependencies:

```sh
npm install
```

3. Build the Tauri application:

```sh
npm run tauri build
```

### Running the Application

To start the development server, run:

```sh
npm run tauri dev
```

### Building the Application

To build the application for production, run:

```sh
npm run build
```

## Usage

1. **Add a Profile**: Click on the "Add Profile" button and fill in the profile details.
2. **Activate a Profile**: Click on the "Activate" button on a profile card to switch to that profile.
3. **Edit a Profile**: Click on the "Edit" button on a profile card to update the profile details.
4. **Delete a Profile**: Click on the "Delete" button on a profile card to remove the profile.
5. **View Configuration**: The current Git configuration is displayed in the "Current Git Configuration" section.
6. **Refresh Configuration**: Click on the "Refresh" button to reload the Git configuration.
7. **Open in Editor**: Click on the "Open in Text Editor" button to open the Git configuration file in the default text editor.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- [Tauri](https://tauri.app/)
- [React](https://reactjs.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)

## Contact

For any questions or suggestions, please contact.

---

Happy coding! 🚀
