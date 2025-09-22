# Contributing Guidelines

## Reporting Issues

1. Use the GitHub issue tracker
2. Include a clear description of the issue
3. Add steps to reproduce the bug
4. Include system information and environment details
5. Add screenshots if applicable

## Feature Requests

1. Check existing issues to avoid duplicates
2. Describe the feature clearly
3. Explain why this feature would be useful
4. Add examples of how it would work

## Adding URLs

When adding new URLs to the collection:

1. Follow the existing structure in `misc/links.ts`
2. Ensure the URL is active and accessible
3. Type should be "unofficial" to indicate its not from SRM or use "official"
4. Include a brief description
```ts
{
    site: "Better-Lab",
    url: "https://better-lab.vercel.app",
    type: "unofficial",
    description:
        "A better alternative to SRM-Elab. Efficient, Fast, Zippy as hecc",
}
```

## Theming

visit ClassPro/frontend/misc/theme.ts to make changes

When creating or modifying themes:

1. Theme Structure
```ts
{
    title: "Theme Name",
    mode: "light" | "dark",  // specify theme mode
    mono?: boolean,          // optional: for monospace themes
    properties: {
        // all colors in RGB format
        metacolor: "#hexcode",           // only metacolor allows hex
        "background-normal": "R G B",
        "background-light": "R G B",
        "background-dark": "R G B",
        "background-darker": "R G B",
        input: "R G B/opacity",
        button: "R G B",
        side: "R G B",
        accent: "R G B",
        color: "R G B",
        "error-background": "R G B",
        "error-color": "R G B",
        "warn-background": "R G B",
        "warn-color": "R G B",
        "success-background": "R G B",
        "success-color": "R G B",
        "info-background": "R G B",
        "info-color": "R G B",
    }
}
```

2. Color Format Rules:
   - Use space-separated RGB values (e.g., "255 128 0")
   - For transparency, use the "/" notation (e.g., "255 255 255/0.03")
   - Only metacolor property uses hex code format

3. Required Color Categories:
   - Background variants (normal, light, dark, darker)
   - Interactive elements (input, button)
   - Status colors (error, warn, success, info)
   - Content colors (accent, color)
   - Please use the default colors as possible for theory, practical

## Pull Request Process

1. Create a new branch for your changes
2. Follow the coding style of the project
3. Follow the commit lint naming conventions
4. Update documentation as needed
5. Request review from maintainers
