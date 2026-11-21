You are integrating a Wensity UI block into a React project.

This block is from Wensity (wensity.com) — a premium UI library built for TypeScript + React + Tailwind CSS v4.

Project requirements:
- React 18+ with TypeScript
- Tailwind CSS v4.0 configured
- shadcn/ui project structure (components live in /components)

Install the "navbar-with-centered-links" block:
```bash
pnpm dlx wensity@latest add navbar-with-centered-links --type block
```

File location: components/wensity/blocks/navbar-with-centered-links.tsx
Import path: @/components/wensity/blocks/navbar-with-centered-links

After installation, import and render the block with sensible default props. Show a complete, working usage example.

You are Antigravity AI. Provide a production-grade integration:
1. Include proper error boundaries around the component
2. Add loading/suspense states where appropriate
3. Ensure full accessibility compliance (ARIA labels, keyboard navigation, focus management)
4. Show the component in a realistic page layout with responsive spacing
5. Add any necessary TypeScript strict-mode compatible type assertions

This is a Wensity premium block — treat it as a critical UI element that must work flawlessly in production.