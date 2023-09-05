# About

The purpose of this site, is to explore technologies and sometimes indulge in "can I do it" rather then "should I do it.
Initial focus is on layout, styling and data vizualisation.

Stack so far is:

- Astro as main framework. [Why Astro](https://docs.astro.build/en/concepts/why-astro/).
- [D3.js](https://d3js.org/) for graphs.
- [Tailwind](Tailwind) for styling.

## What's great with Astro

Astro has been hyped a lot, and for good reason!

You know how often you just want to start with an idea, and not get locked into decisions too early?<br>
Particularly if the project is going to be simple initially? Maybe you dont even need any JavaScript?

Out of the box you get a simple SSR static MPA to do a cool CSS layout. The first page is lightning fast, with HTML and CSS on the same page similar to vue.js. You can decide on how to structure your styling later. To start with everything is nicely scoped to the current file.

#### Astro's strongest feature is how it scales.

I start with a simple landing page. Test out layout and designs.

Astro lets you use MULTIPLE frameworks at once! I started out with Astro, added a React.js file based on earlier work, then threw in a Solid.js to try it out. And it all works! You can actually change framework on your application file by file.

Like this scenario. I decide I need to add a feature that requires client side rendering. I might already have written the exact thing I need in another language. This is how I added react:

1. Install the plugin `@astrojs/react-⁠js`.
2. Import the component to your Astro page.
3. Add the directive `client:only="react"` to the component.
4. Run it!

#### Hydration

Some great features are the directives like `client:load, client:idle, client:visible and client:only` These let you select the priority of how elements load, which helps the site feel much faster.

#### Performance

Astro's gotten a lot of attention because of how well it scales, and reports seems to agree: [Web framework performance report](https://astro.build/blog/2023-web-framework-performance-report/). The key is to minimize JavaScript, and only serve server side rendered CSS and HTML when possible.

performance
dynamic routes like nextjs.
full SSR
