# [1.6.0](https://github.com/ntsation/portfolio/compare/v1.5.0...v1.6.0) (2026-09-04)


### Bug Fixes

* gracefully handle missing Dependabot alerts permission ([8e98700](https://github.com/ntsation/portfolio/commit/8e98700976ce557c9299fe84a17f7d6f64a8d843))
* pass --repo explicitly to gh CLI calls with no checkout ([65fd10d](https://github.com/ntsation/portfolio/commit/65fd10ddc2e1cb6b7797224c1f7bcc58bfa796fa))
* send the workflow warning annotation to stderr, not the issue body ([9cb8378](https://github.com/ntsation/portfolio/commit/9cb8378ea97193790eac22f0e76b5f5c62e80b61))
* use RELEASE_PAT to let semantic-release push past branch protection ([c00d063](https://github.com/ntsation/portfolio/commit/c00d0633c743aea9551db44fcea13a1acf2401b4))


### Features

* auto-close the dashboard issue when nothing is pending ([57ba039](https://github.com/ntsation/portfolio/commit/57ba0396de96b884f303b964a3bd94c93f2b5ea0))

# [1.5.0](https://github.com/ntsation/portfolio/compare/v1.4.0...v1.5.0) (2026-08-26)


### Features

* **ci:** scaffold Deploy workflow for future Oracle instance rollout ([b508dd7](https://github.com/ntsation/portfolio/commit/b508dd74edf5a4c87a9d536cc837299052461ce3))

# [1.4.0](https://github.com/ntsation/portfolio/compare/v1.3.1...v1.4.0) (2026-08-22)


### Features

* **ci:** rebuild pages on a daily schedule and via repository_dispatch ([47ab9c7](https://github.com/ntsation/portfolio/commit/47ab9c7f6f5dad54c992f8917b16bf09d3962a62))

## [1.3.1](https://github.com/ntsation/portfolio/compare/v1.3.0...v1.3.1) (2026-08-22)


### Bug Fixes

* **seo:** drop the site-name suffix from per-page titles ([b577e3e](https://github.com/ntsation/portfolio/commit/b577e3ef31f19461350d9f7932501aa4d1e3c208))

# [1.3.0](https://github.com/ntsation/portfolio/compare/v1.2.0...v1.3.0) (2026-08-22)


### Features

* **seo:** per-page Open Graph previews via BrowserRouter + prerendering ([81900f1](https://github.com/ntsation/portfolio/commit/81900f157c66172954727f63cc77d3d53e5b8388))

# [1.2.0](https://github.com/ntsation/portfolio/compare/v1.1.1...v1.2.0) (2026-08-22)


### Features

* **data:** include tweet-sentiment-analysis in project listing ([bc96a00](https://github.com/ntsation/portfolio/commit/bc96a00b7fb1be121676111eb707f8c2deaf3bcc))

## [1.1.1](https://github.com/ntsation/portfolio/compare/v1.1.0...v1.1.1) (2026-08-22)


### Bug Fixes

* **data:** exclude portfolio repo from its own project listing ([065aa30](https://github.com/ntsation/portfolio/commit/065aa30a2ed32ed70c9ce9e3cc1e631e886ef4af))

# [1.1.0](https://github.com/ntsation/portfolio/compare/v1.0.0...v1.1.0) (2026-08-22)


### Features

* **pages:** deploy to GitHub Pages alongside the existing Docker image ([ea85283](https://github.com/ntsation/portfolio/commit/ea8528344837df34c243a80d40ca868f25c29a13))

# 1.0.0 (2026-08-22)


### Features

* **ci:** add github actions pipelines matching sentiment-analysis-api and tweet-sentiment-analysis ([3b7c5a6](https://github.com/ntsation/portfolio/commit/3b7c5a697efae57db443e9d566af49e8fa343b97))
