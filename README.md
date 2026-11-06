<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/47adf0d1-d13a-4b1c-854b-e0fd53ccc864

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Watch display (Galaxy Watch / Wear OS)

The UI is laid out on a round "face" where `1rem = face diameter / 15`
(see the fit engine in `index.html`). This keeps the layout identical whether
the watch browser reports the screen as 219px, 240px, 480px or a 980px
"desktop mode" viewport, and stops WebView text-zoom from breaking it.

- **On a watch** the face fills the screen automatically.
- **On a phone or desktop** it is shown inside a bezel as an exact,
  proportional preview of what the watch will display.
- Override detection with `?fit=watch`, `?fit=frame` or `?fit=auto`
  (remembered), or in **Settings → Screen fit**.

Navigation: the curved dock at the bottom holds **Search**, **Flight brief ⇄
Weather** and **Settings**. Tap the observation-time chip to refresh. The
watch's Back key / swipe-back closes the current layer.
