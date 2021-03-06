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
