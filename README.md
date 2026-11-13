# Voltline Electric Co.: concept website

A concept website by [Mago Labs](https://magolabs.in) for a fictional Philadelphia electrician. Voltline Electric Co. is not a real business: the name, logo, phone number, address and reviews are invented, and the photos are stock images from Unsplash.

## Stack
Plain HTML, CSS and vanilla JS. No build step. Fonts self-hosted.

- `index.html`: the page
- `assets/styles.css`, `assets/app.js`: styles and behaviour
- `assets/js/motion.js`: scroll progress, count-ups, tilt, ripple, scroll-drawn wire
- `assets/js/fx3d.min.js`: WebGL 3D bolt in the hero (three.js, loaded after first paint, static fallback without WebGL)
- `vercel.json`: security headers and asset caching
- `robots.txt`: blocks indexing
