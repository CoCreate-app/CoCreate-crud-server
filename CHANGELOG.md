## [1.13.7](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.13.6...v1.13.7) (2022-11-24)


### Bug Fixes

* bump depenedencies ([171680b](https://github.com/CoCreate-app/CoCreate-crud-server/commit/171680bd8d9b340fbcc84640a2c378e6b098e5f5))

## [1.13.6](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.13.5...v1.13.6) (2022-11-23)


### Bug Fixes

* bumped [@cocreate](https://github.com/cocreate) dependencies ([073a756](https://github.com/CoCreate-app/CoCreate-crud-server/commit/073a75625acc077a62581b4462f36364a00bde42))

## [1.13.5](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.13.4...v1.13.5) (2022-11-22)


### Bug Fixes

* workflow docs ([510b330](https://github.com/CoCreate-app/CoCreate-crud-server/commit/510b330f7dae06a2b16c18101664c51cde487a69))

## [1.13.4](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.13.3...v1.13.4) (2022-11-22)


### Bug Fixes

* apply src: {{source}} to CoCreate.config ([237b097](https://github.com/CoCreate-app/CoCreate-crud-server/commit/237b0978e754341174cfcdc46bf78f25b11af068))

## [1.13.3](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.13.2...v1.13.3) (2022-11-21)


### Bug Fixes

* @cocreate/docs bug fix ([de8881d](https://github.com/CoCreate-app/CoCreate-crud-server/commit/de8881d76ba776707994e1574b94bb4264e60e1a))

## [1.13.2](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.13.1...v1.13.2) (2022-11-21)


### Bug Fixes

* add timeStamp if does not already exist ([3f8f432](https://github.com/CoCreate-app/CoCreate-crud-server/commit/3f8f432e0fa9da67945b70fdbd05e9821afb15cb))

## [1.13.1](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.13.0...v1.13.1) (2022-11-21)


### Bug Fixes

* bump [@cocreate](https://github.com/cocreate) dependencies ([b590c7b](https://github.com/CoCreate-app/CoCreate-crud-server/commit/b590c7bb926a8266561e5b40d239434dd84eb37c))

# [1.13.0](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.12.0...v1.13.0) (2022-11-21)


### Bug Fixes

* bump [@cocreate](https://github.com/cocreate) dependencies ([a7abd3b](https://github.com/CoCreate-app/CoCreate-crud-server/commit/a7abd3bb30a8d6c46dce0033a2fa67e33ff6e548))
* data.request takes priority ([d8f584e](https://github.com/CoCreate-app/CoCreate-crud-server/commit/d8f584ee978c4ae6dcd66e30a46f66724d60bb04))
* removed data.data ([cc66783](https://github.com/CoCreate-app/CoCreate-crud-server/commit/cc66783f6733ea67ae990f9894a94cea0993f069))
* renamed data.data to data.document ([ed5348f](https://github.com/CoCreate-app/CoCreate-crud-server/commit/ed5348f9a5da8055b885b7e142acd2eec5e02be8))
* set _id using ObjectId ([f2420f6](https://github.com/CoCreate-app/CoCreate-crud-server/commit/f2420f6ac26bc636c76a81fc152e474cdb3075a4))


### Features

* broadcast crud  even if no database exist in server ([5b53fc2](https://github.com/CoCreate-app/CoCreate-crud-server/commit/5b53fc27a353f00617638fb36da278e76aa88b79))
* crud can connect to multiple databases, mongodb adapter for crud ([b4e6b61](https://github.com/CoCreate-app/CoCreate-crud-server/commit/b4e6b618e4c6197a9fe1cb2a32f7419898e86d30))
* data response also available as data.document, improved handeling of data[type] ([bb25d9f](https://github.com/CoCreate-app/CoCreate-crud-server/commit/bb25d9f57875bbaa03bd2cafd9333e5f9d0c57f9))
* mongodb - crud multiple databases, collections, and documents ([1ec4b27](https://github.com/CoCreate-app/CoCreate-crud-server/commit/1ec4b278e4ce830d8e452944c144ecb434027c37))
* return documents containing db, database, and collection ([d13db96](https://github.com/CoCreate-app/CoCreate-crud-server/commit/d13db962500fc196af68f6c8e227ce9ba3241188))

# [1.12.0](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.11.1...v1.12.0) (2022-10-02)


### Bug Fixes

* bump dependencies ([702bf69](https://github.com/CoCreate-app/CoCreate-crud-server/commit/702bf6960c6efc9563e923325cc03ba2f1e842df))


### Features

* support for operator $contain and $regex ([fb7d4a5](https://github.com/CoCreate-app/CoCreate-crud-server/commit/fb7d4a5508c0ca75100ba40305196ed2b7ea7d6b))

## [1.11.1](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.11.0...v1.11.1) (2022-10-01)


### Bug Fixes

* bump [@cocreate](https://github.com/cocreate) dependencies ([12a2ae4](https://github.com/CoCreate-app/CoCreate-crud-server/commit/12a2ae454f0b12424f4c072b9dd2b31e02c20ade))

# [1.11.0](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.10.1...v1.11.0) (2022-10-01)


### Bug Fixes

* broadcast params reduced to socket, message, data ([ec9c8f2](https://github.com/CoCreate-app/CoCreate-crud-server/commit/ec9c8f259e516424ef95433904a0e89d2aa0c727))
* bump dependencies ([b5b9350](https://github.com/CoCreate-app/CoCreate-crud-server/commit/b5b9350dbcb1b20fc945542a600d526ddb78fb91))
* createDocument inserts  _id in the data object ([113c2ff](https://github.com/CoCreate-app/CoCreate-crud-server/commit/113c2ffb3d0a291f3af8ba645f709b1b5811089d))
* createQuery ObjectId ([ec79e40](https://github.com/CoCreate-app/CoCreate-crud-server/commit/ec79e40b81760e347ce5d8d70ed28f3494c49538))
* filter value can be an object or an array ([75cd195](https://github.com/CoCreate-app/CoCreate-crud-server/commit/75cd19560d8086f01a05f55e76102793789ec1d1))
* merged crud and list ([acff218](https://github.com/CoCreate-app/CoCreate-crud-server/commit/acff21831b2ca1274bc5af775f7d3758f2e55663))
* relocate and import filter.js from @cocreate/filter ([b8bab38](https://github.com/CoCreate-app/CoCreate-crud-server/commit/b8bab3882b5ece91115a4568aa80bc5eca2c80f3))


### Features

* config now accessible from socket.config ([2d892ff](https://github.com/CoCreate-app/CoCreate-crud-server/commit/2d892ff961cb48187f8253a4f3778719cb764d1c))
* if data.returnDocument = false only defined names are returned ([652f624](https://github.com/CoCreate-app/CoCreate-crud-server/commit/652f6242c947d3b46d01deaea784f964f43450fd))

## [1.10.1](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.10.0...v1.10.1) (2022-09-01)


### Bug Fixes

* bump dependencies ([15b088a](https://github.com/CoCreate-app/CoCreate-crud-server/commit/15b088ad50ecd57b77a442bf6f99bdae8fffdf09))

# [1.10.0](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.9.2...v1.10.0) (2022-08-31)


### Features

* filter, query and sort collections ([6399e8c](https://github.com/CoCreate-app/CoCreate-crud-server/commit/6399e8ccae1a1ff713335d47b1bb73c7af154e85))
* rename and delete keys from db ([03d5387](https://github.com/CoCreate-app/CoCreate-crud-server/commit/03d5387c30512b4723a60a7439b71b86c7a6834d))

## [1.9.2](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.9.1...v1.9.2) (2022-07-29)


### Bug Fixes

* set collection as collections for function readCollections ([73341cf](https://github.com/CoCreate-app/CoCreate-crud-server/commit/73341cfc11cab2c10f5f21ac791806f099fcdea0))

## [1.9.1](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.9.0...v1.9.1) (2022-07-27)


### Bug Fixes

* typo with broadcasting collection messageName ([a3a9bea](https://github.com/CoCreate-app/CoCreate-crud-server/commit/a3a9beab885014fd0f90ce1c2b7e3c73014aa221))

# [1.9.0](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.8.0...v1.9.0) (2022-07-25)


### Features

* crud support on collection names ([c569657](https://github.com/CoCreate-app/CoCreate-crud-server/commit/c569657f0ab339952c4aa72bbab2a7667c0f9986))
* update arrayValues to mongoDb dotNotation, removed isFlat ([ab2fb60](https://github.com/CoCreate-app/CoCreate-crud-server/commit/ab2fb601f660b3b96f7584ca66be1cb3902095eb))

# [1.8.0](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.7.0...v1.8.0) (2022-05-29)


### Features

* added constructor ([6335895](https://github.com/CoCreate-app/CoCreate-crud-server/commit/6335895e052a34bb3c560f882db80a6abb5b1582))
* added constructor ([8af6d34](https://github.com/CoCreate-app/CoCreate-crud-server/commit/8af6d34d0551d8380043103f0cc598d071a057d4))

# [1.7.0](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.6.0...v1.7.0) (2022-05-28)


### Features

* readDatabases returns a list of databases in DB ([5c65622](https://github.com/CoCreate-app/CoCreate-crud-server/commit/5c65622908c5a154ade344aab48fb36b816470d6))

# [1.6.0](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.5.1...v1.6.0) (2022-05-25)


### Features

* auto detects and updates data type ([ddb1391](https://github.com/CoCreate-app/CoCreate-crud-server/commit/ddb1391928a8a7acccd8d9e4c920adfdeb63f002))

## [1.5.1](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.5.0...v1.5.1) (2022-05-17)


### Bug Fixes

* get orgId from socketInfo ([da03da3](https://github.com/CoCreate-app/CoCreate-crud-server/commit/da03da39aa383c71a802bbbfa9ecea5b637c5262))
* reorder broadcast params ([96deccb](https://github.com/CoCreate-app/CoCreate-crud-server/commit/96deccb415e47dbfbfad4311985b3a7082cb57ff))

# [1.5.0](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.4.4...v1.5.0) (2022-05-14)


### Features

* function readDocumentList has been renamed to readDocuments ([3081581](https://github.com/CoCreate-app/CoCreate-crud-server/commit/308158148dccc82411e625d8270e5dd107b7df94))

## [1.4.4](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.4.3...v1.4.4) (2022-05-13)


### Bug Fixes

* removed readDocument error console.log ([0ca8012](https://github.com/CoCreate-app/CoCreate-crud-server/commit/0ca8012b3f9e1d2efccdfb4216bf1ccfe430b026))

## [1.4.3](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.4.2...v1.4.3) (2022-05-12)


### Bug Fixes

* updateDocument now sends updated data ([f18d5e7](https://github.com/CoCreate-app/CoCreate-crud-server/commit/f18d5e7705658463326b276771825393603279e0))

## [1.4.2](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.4.1...v1.4.2) (2022-05-12)


### Bug Fixes

* createDocument requires organization_id to be stored ([259f56d](https://github.com/CoCreate-app/CoCreate-crud-server/commit/259f56daadc6b9e148f054c0ba2cf04443122a6a))

## [1.4.1](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.4.0...v1.4.1) (2022-05-06)


### Bug Fixes

* replace ObjectID with ObjectId due to mongodb depreciation ([93e4294](https://github.com/CoCreate-app/CoCreate-crud-server/commit/93e42944447357ec6a244b72ce968bbd8ff5c93d))
* update config organization_Id to organization_id ([996611b](https://github.com/CoCreate-app/CoCreate-crud-server/commit/996611baf2b2d3afbf895ef193ae15ba7226e77a))

# [1.4.0](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.3.4...v1.4.0) (2022-04-01)


### Features

* readCollections to return a list of collections ([2ad15d4](https://github.com/CoCreate-app/CoCreate-crud-server/commit/2ad15d43baf22c6dabbf56582cac182dec8876ad))

## [1.3.4](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.3.3...v1.3.4) (2022-03-06)


### Bug Fixes

* broadcast_sender if condition removed and handeled by socket ([c2a0a6d](https://github.com/CoCreate-app/CoCreate-crud-server/commit/c2a0a6d79d331e56160cd9ddaf8a7e521e2270e8))
* removed param isExact from broadcast as it can be handled by param room ([e709e36](https://github.com/CoCreate-app/CoCreate-crud-server/commit/e709e366493759399f371f2ffc3c630e415f8daa))
* update param roomInfo to socketInfo ([f50edc9](https://github.com/CoCreate-app/CoCreate-crud-server/commit/f50edc91ee4695f6a652fd8a8c943feac24ba80a))

## [1.3.3](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.3.2...v1.3.3) (2022-03-05)


### Bug Fixes

* typo reponse to response ([bbc67bf](https://github.com/CoCreate-app/CoCreate-crud-server/commit/bbc67bf99652175a3a9f6ccbdd7cd08cf5a536ba))

## [1.3.2](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.3.1...v1.3.2) (2022-03-04)


### Bug Fixes

* add self.wsManager ([537375e](https://github.com/CoCreate-app/CoCreate-crud-server/commit/537375ec182242ff012f0ed11a6d3fe5f905ff26))

## [1.3.1](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.3.0...v1.3.1) (2022-03-04)


### Bug Fixes

* bump version ([3b7adce](https://github.com/CoCreate-app/CoCreate-crud-server/commit/3b7adcef74cf426dc34d723478c44360a6f28219))

# [1.3.0](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.2.10...v1.3.0) (2022-03-03)


### Bug Fixes

* moved files to there relative components ([a2b2f8c](https://github.com/CoCreate-app/CoCreate-crud-server/commit/a2b2f8c52a923cb4fad86331ff7121b19db3d527))
* remove securityCheck function, it has be replaced by permissions ([818b8d2](https://github.com/CoCreate-app/CoCreate-crud-server/commit/818b8d2e8631027242930633090510b579ecc914))


### Features

* deleteIndustry function ([ee85ff2](https://github.com/CoCreate-app/CoCreate-crud-server/commit/ee85ff2c09781159c4aa4950f209d785c32fcbab))

## [1.2.10](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.2.9...v1.2.10) (2022-02-28)


### Bug Fixes

* moved index.js to src/ ([fdeb6c4](https://github.com/CoCreate-app/CoCreate-crud-server/commit/fdeb6c4a4ba4cc201e935268ad9d1feccdd4fbac))

## [1.2.9](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.2.8...v1.2.9) (2022-02-28)


### Bug Fixes

* config docs wildcard * domain ([c2a5856](https://github.com/CoCreate-app/CoCreate-crud-server/commit/c2a58569460e0fa45c594f6b70d7ade32e703ebb))
* update param is_flat to isFlat ([40a9b61](https://github.com/CoCreate-app/CoCreate-crud-server/commit/40a9b61408b5379aef3a798e1fdbc64016c3e980))
* updated is_flat to default false ([f0c2f00](https://github.com/CoCreate-app/CoCreate-crud-server/commit/f0c2f002c33ff8d0e1f3b306a2999cced5535936))

## [1.2.8](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.2.7...v1.2.8) (2022-02-16)


### Bug Fixes

* update dependencies ([1efd2d6](https://github.com/CoCreate-app/CoCreate-crud-server/commit/1efd2d680a81c43c421e3a1118c0da288b85b17c))

## [1.2.7](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.2.6...v1.2.7) (2022-02-09)


### Bug Fixes

* add document_id to CoCreate.config ([f649cb4](https://github.com/CoCreate-app/CoCreate-crud-server/commit/f649cb45ff2ee1937d3e0ff28db981f9a26ca80e))

## [1.2.6](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.2.5...v1.2.6) (2022-02-09)


### Bug Fixes

* update CoCreate.config.js, bump @cocreate/docs version ([0685184](https://github.com/CoCreate-app/CoCreate-crud-server/commit/06851842ca7b786d3f3b939d1942918493f092e2))

## [1.2.5](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.2.4...v1.2.5) (2021-11-11)


### Bug Fixes

* licensing information ([63a3e14](https://github.com/CoCreate-app/CoCreate-crud-server/commit/63a3e142777a6e2ef97cb9b304d7ec17877304d8))
* update readme ([f1ab97b](https://github.com/CoCreate-app/CoCreate-crud-server/commit/f1ab97bbef8e09ecbcf760439ab0b8973029c282))

## [1.2.4](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.2.3...v1.2.4) (2021-11-11)


### Bug Fixes

* update .gitignore ([58befdb](https://github.com/CoCreate-app/CoCreate-crud-server/commit/58befdb99b350cfc0a6f2f6c556c9fce0042ceb6))

## [1.2.3](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.2.2...v1.2.3) (2021-11-11)


### Bug Fixes

* missing mongodb ([2938d8c](https://github.com/CoCreate-app/CoCreate-crud-server/commit/2938d8c4f28690d6a3e83867015327d4fa9f009a))

## [1.2.2](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.2.1...v1.2.2) (2021-11-07)


### Bug Fixes

* typo in readme ([cddd7a7](https://github.com/CoCreate-app/CoCreate-crud-server/commit/cddd7a73fd0e5d4b559dd5129ea24bbb20614d36))

## [1.2.1](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.2.0...v1.2.1) (2021-11-07)


### Bug Fixes

* package made public ([19e40a1](https://github.com/CoCreate-app/CoCreate-crud-server/commit/19e40a1c2cc2e1fda3ffa21d484e8b49c0338a40))

# [1.2.0](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.1.10...v1.2.0) (2021-10-11)


### Features

* unique.js returns true or false for a name:value in a collection ([9451315](https://github.com/CoCreate-app/CoCreate-crud-server/commit/94513152cdbefef214f2863ec451b4dab67ab391))

## [1.1.10](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.1.9...v1.1.10) (2021-07-28)


### Bug Fixes

* removed data- from crud, fetch, filter and pass attributes ([f42cb1a](https://github.com/CoCreate-app/CoCreate-crud-server/commit/f42cb1aec8e8e47f611b2208c3d9c3f981246037))

## [1.1.9](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.1.8...v1.1.9) (2021-07-26)


### Bug Fixes

* refactored to newOrg_id convention ([78ba5b8](https://github.com/CoCreate-app/CoCreate-crud-server/commit/78ba5b8f27438cd8d898ff8a5c7955f321d557c9))

## [1.1.8](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.1.7...v1.1.8) (2021-07-26)


### Bug Fixes

* create org in masterDb ([c15e92e](https://github.com/CoCreate-app/CoCreate-crud-server/commit/c15e92eb29bdf519a19d0ab3db7a0e8379568430))

## [1.1.7](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.1.6...v1.1.7) (2021-07-23)


### Bug Fixes

* industry creates in org defined in config ([5cf9139](https://github.com/CoCreate-app/CoCreate-crud-server/commit/5cf91399a34b800ae3253f4fcd2785eb52f3cd9b))

## [1.1.6](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.1.5...v1.1.6) (2021-07-22)


### Bug Fixes

* createIndustryNew renamed to createIndustry ([7fd343f](https://github.com/CoCreate-app/CoCreate-crud-server/commit/7fd343f3d5a20c7cb0c52f49fc67f8921fd8bbe3))

## [1.1.5](https://github.com/CoCreate-app/CoCreate-crud-server/compare/v1.1.4...v1.1.5) (2021-07-17)


### Bug Fixes

* add release.config ([dfa3395](https://github.com/CoCreate-app/CoCreate-crud-server/commit/dfa3395540e0e2a434f58bfa5704eb77ebd13f57))
