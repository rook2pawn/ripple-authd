# ripple-auth

The [Ripple client](https://github.com/ripple/ripple-client) uses `ripple-authd` servers for [peer-assisted key derivation](http://justmoon.github.io/pakdf/).

# Setup

``` sh
# Clone repository
git clone [repo url] ripple-authd
cd ripple-authd

# Install dependencies
npm install

# Initialize the configuration
cp config-example.js config.js

# Generate a key
npm run gen
```

# Running

``` sh
node app
```

Note that `ripple-authd` is purely an API server, so there are no HTML pages
etc. to look at.

# Credits

(c) 2013 OpenCoin Inc.  
Released under ISC license  

