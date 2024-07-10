General project structure in Markdown. Date: July 8, 2024. Intermittently updated.

1. Directory structure

```
└── 📁news-article-collection-container
    └── 📁.github
        └── 📁workflows
    └── 📁client
        └── 📁src
            └── 📁components
                └── 📁ui
            └── 📁css
            └── 📁lib
            └── 📁services
        └── 📁tests
            └── 📁e2e
            └── 📁internal
    └── 📁docs
        └── 📁assets
    └── 📁manifests
        └── 📁manifests_playground
    └── 📁server
        └── 📁data_acquisition
        └── 📁data_analysis
        └── 📁data_export
        └── 📁tests
```

```
└── 📁news-article-collection
```

2. Whole structure including files

```
└── 📁news-article-collection-container
    └── 📁.github
        └── 📁workflows
            └── dev.yml
            └── main.yml
            └── playground.yml
    └── .pylintrc
    └── Dockerfile
    └── LICENSE
    └── README.md
    └── 📁client
        └── .eslintrc.cjs
        └── .eslintrc.json
        └── .prettierrc
        └── Dockerfile
        └── README.md
        └── components.json
        └── cypress.config.ts
        └── index.html
        └── package-lock.json
        └── package.json
        └── postcss.config.js
        └── 📁src
            └── App.tsx
            └── 📁components
                └── footer.tsx
                └── header.tsx
                └── logs.tsx
                └── questions-accordion.tsx
                └── rss-input.tsx
                └── timeseries.tsx
                └── 📁ui
                    └── accordion.tsx
                    └── article-columns.tsx
                    └── button.tsx
                    └── card.tsx
                    └── checkbox.tsx
                    └── data-table.tsx
                    └── drawer.tsx
                    └── dropdown-menu.tsx
                    └── feed-columns.tsx
                    └── form.tsx
                    └── highlighted-text.tsx
                    └── input.tsx
                    └── label.tsx
                    └── mode-toggle.tsx
                    └── separator.tsx
                    └── skeleton.tsx
                    └── sonner.tsx
                    └── table.tsx
                    └── textarea.tsx
                    └── theme-provider.tsx
                    └── toast.tsx
                    └── toaster.tsx
                    └── use-toast.ts
            └── 📁css
                └── index.css
            └── 📁lib
                └── utils.ts
            └── main.tsx
            └── 📁services
                └── database_queries.tsx
                └── feed_urls.tsx
                └── fetching-news.tsx
                └── log_records.tsx
            └── vite-env.d.ts
        └── tailwind.config.ts
        └── 📁tests
            └── 📁e2e
                └── news_article_collector.cy.ts
            └── 📁internal
                └── App.test.tsx
                └── button.test.tsx
                └── card.test.tsx
                └── data-table.test.tsx
                └── footer.test.tsx
                └── header.test.tsx
                └── input.test.tsx
                └── label.test.tsx
                └── questions-accordion.test.tsx
                └── rss-input.test.tsx
                └── setupTests.ts
                └── sonner.test.tsx
        └── tsconfig.json
        └── tsconfig.node.json
        └── vite.config.ts
    └── docker-compose.dev.yml
    └── docker-compose.yml
    └── 📁docs
        └── 📁assets
            └── rahti
        └── dod-practices.md
        └── rahti.md
        └── testing-instructions.md
        └── project-structure.md
    └── 📁manifests
        └── build-prod.yaml
        └── deployment-prod.yaml
        └── image-stream.yaml
        └── 📁manifests_playground
            └── deployment.yaml
            └── imagestream.yaml
            └── route.yaml
        └── pvc-prod.yaml
        └── service-route-prod.yaml
    └── 📁server
        └── Dockerfile
        └── app.py
        └── config.py
        └── 📁data_acquisition
            └── content_fetcher.py
            └── feed_manager.py
        └── 📁data_analysis
            └── query_processor.py
            └── stats_analyzer.py
        └── 📁data_export
            └── export_manager.py
            └── format_converter.py
        └── log_config.py
        └── requirements.txt
        └── scheduler_config.py
        └── 📁tests
            └── conftest.py
            └── database_filler.py
            └── test_app.py
            └── test_content_fetcher.py
            └── test_export_manager.py
            └── test_feed_manager.py
            └── test_format_converter.py
            └── test_query_processor.py
            └── test_stats_analyzer.py
```

```
└── 📁news-article-collection
    └── README.md
    └── collect.py
    └── database.py
    └── process.py
    └── requirements.txt
```
