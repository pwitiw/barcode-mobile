#run
npx expo start

#build command
sudo npm install -g eas-cli
eas build -p android
eas init --id ${id}
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"