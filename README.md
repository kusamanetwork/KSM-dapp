# KSM DApp

Interface for the Kusama user guide and claims process.

## Guide

The user guide is rendered from [Markdown]() files located in the `src/docs` directory and displayed with the `src/Manual.jsx` component. The `Manual.jsx` component takes a configuration as follows:

```
const Config = [
  { title: "Overview", source: Overview, path: '/overview' },
  { title: "How to Claim", source: Claiming, path: '/claiming'},
  { title: "Governance", source: Security, path: '/governance' },
  { title: "Validator Security", source: Security, path: '/validators' },
  { title: "Code of Conduct", source: Security, path: '/code-of-conduct' },
  { title: "Critical Issues / Bugs", source: Security, path: '/issues' },
];
```

The `title` will render as the side navigation button for the page, the source is a direct import of the Markdown file and the path is suffix of the entire URL.

## Claims

The DApp also facilitates claiming Kusama addresses. The two processes of claiming KSM can occur before genesis or after genesis.

- [X] Claiming before genesis on Ethereum.
- [] Claiming after genesis on Kusama.
