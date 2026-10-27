// netlify/functions/track-interaction.js
// Backward-compatible alias routing directly to track-social-click.js

const trackSocialClick = require('./track-social-click');

exports.handler = async (event, context) => {
  return trackSocialClick.handler(event, context);
};
