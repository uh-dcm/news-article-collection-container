General project structure in Markdown.

1. Mermaid graph of the directories of the main functionalities

```mermaid
graph TD
    A[news-article-collection-container] --> C[client]
    A --> F[server]

    C --> C1[public]
    C --> C2[src]
    C --> C3[tests]

    C2A --> C2A1[ui]

    C2 --> C2A[components]
    C2 --> C2B[css]
    C2 --> C2C[features]
    C2 --> C2D[lib]
    C2 --> C2E[services]

    C2C --> C2C1[dashboard]
    C2C --> C2C2[errors]
    C2C --> C2C3[info]
    C2C --> C2C4[search]
    C2C --> C2C5[statistics]
    C2C --> C2C6[user]

    F --> F1[src]
    F --> F2[tests]

    F1 --> F1A[views]
    F1 --> F1B[utils]

    F1A --> F1A1[administration]
    F1A --> F1A2[data_acquisition]
    F1A --> F1A3[data_analysis]
    F1A --> F1A4[data_export]

    G[news-article-collection] --> G1[collect.py]
    G --> G2[database.py]
    G --> G3[process.py]
```

2. Project structure in ASCII tree style

```
└── 📁news-article-collection-container
    └── Dockerfile
    └── 📁.github
        └── 📁workflows
    └── 📁client
        └── package.json
        └── 📁public
            └── 📁images
        └── 📁src
            └── App.tsx
            └── main.tsx
            └── 📁components
                └── 📁ui
            └── 📁css
            └── 📁features
                └── 📁dashboard
                └── 📁errors
                └── 📁info
                └── 📁search
                └── 📁statistics
                └── 📁user
            └── 📁lib
            └── 📁services
        └── 📁tests
            └── 📁e2e
            └── 📁internal
    └── 📁docs
        └── 📁assets
    └── 📁manifests
        └── 📁manifests_components
        └── 📁manifests_playground
    └── 📁server
        └── requirements.txt
        └── requirements-dev.txt
        └── 📁src
            └── app.py
            └── 📁views
                └── 📁administration
                └── 📁data_acquisition
                └── 📁data_analysis
                └── 📁data_export
            └── 📁utils
        └── 📁tests
            └── 📁test_views
```

```
└── 📁news-article-collection
    └── collect.py
    └── database.py
    └── process.py
    └── requirements.txt
```

<!-- The whole directory PLUS files was too much work for little benefit. -->
