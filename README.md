<img src="./velocity-tech-test.png" alt="drawing" width="100%"/>

## Welcome, Developer!

You've been tasked with helping Digital Velocity bring a fresh collection page and a functional cart drawer to life. Your goal is to build these features from scratch, incorporating a structure for styling, JavaScript, and HTML that best suits your development style and approach.

The purpose of this exercise isn't to complete everything but rather to demonstrate your thought process, coding practices, and overall implementation skills. You're free to spend as much or as little time on it as you're comfortable with.

### Challange

1. #### Collection Page

    Build a Collection Page that displays a grid of products, styled and structured to match the design specifications.

2. #### Cart Drawer

    Implement a Cart Drawer that slides out and allows users to view and manage their cart seamlessly.

## Getting Started

To get started follow the setup steps below:

1. Fork this repository and navigate into the project directory.
2. Run the following commands:

```
shopify theme push --store=velocity-tech-test --password=shptka_ea1e90de841c7cdaeb2ce101dd28caa6
shopify theme list (find the theme ID for the one you just pushed)
shopify theme dev --store=velocity-tech-test --password=shptka_ea1e90de841c7cdaeb2ce101dd28caa6 --theme=<theme-ID>
```

You may be asked for a store password which is the following: piepea

Please feel free to use your own development store if you'd prefer. We have provided this for ease of getting started.

## Project Designs

URL: https://www.figma.com/design/TkWkSt0pv0zW2wCvNgcvQq/Velocity---Tech-Test?node-id=0-1&m=dev&t=h5BxnTuRw1MdlGcn-1
Password: v3l0c1ty

Note – you may be required to log in to access editing tools to find out css properties.

## Submission

### When you're done, submit:

-   A GitHub repository with your code.
-   A README file with instructions on how to set up and run your project locally.

### What We're Looking For

-   Functionality: Does your solution meet the requirements?
-   Code Quality: Is your code clean, readable, and well-organized?
-   User Experience: Is the interface intuitive and easy to use?

### Good Luck!

If you run into any issues or have any questions, feel free to reach out to a.pearson@digital-velocity.co.uk

---


Thanks very much for the task! I return it to you with the information below. Do let me know if you have any questions.

## Instructions

**Clone the repository**  

```bash
git clone https://github.com/hotblack86/velocity-tech-test.git
cd velocity-tech-test
```

**Install dependencies**  

```bash
npm install
```

**Build CSS**

```bash
npm run build:css
```

- Compiles scss/theme.scss into assets/theme.scss.liquid for Shopify

**Watch CSS for development**

```bash
npm run watch:css
```

- Automatically rebuilds the CSS whenever changes are made to the SCSS
- Keep this running while editing styles for live updates

**Deploy to Shopify**

After building the CSS, push the theme to your development store with:

```bash
shopify theme push --store=velocity-tech-test --password=shptka_ea1e90de841c7cdaeb2ce101dd28caa6
```


Or run a local Shopify dev server:

```bash
shopify theme dev --store=velocity-tech-test --password=shptka_ea1e90de841c7cdaeb2ce101dd28caa6 --theme=185643172177
```


## Notes
- The cart drawer is implemented as a self-contained Web Component, making it reusable across different pages and products.

- Dynamic cart updates: The cart content, totals, and header count update in real-time based on Shopify’s AJAX cart API.

- Accessibility: The cart drawer uses aria-hidden and focus management for better screen reader support.

- Mobile-friendly: Cart and product grids are fully responsive and scrollable on small devices.

- SCSS architecture: Variables are used for colors, spacing, typography, and BEM naming conventions are followed for maintainable CSS.

- Smooth UI transitions: Opening/closing the cart and button interactions have subtle animations for better UX.

- Error handling: Cart API requests have try/catch blocks to gracefully handle network errors.

- Optimized image handling: Product images are automatically resized via URL manipulation to reduce payload.

- Development workflow: SCSS is compiled to Shopify Liquid assets and can be watched for live CSS updates.

- CSS architecture: CSS variables are used for colors, typography, and BEM naming conventions are followed for maintainable CSS.