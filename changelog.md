# Changelog

## [Unreleased]

### Added
- Connected User Registration and Login flows directly to backend SQLite persistence
- Added full teacher Whiteboard Canvas functionality leveraging \eact-sketch-canvas\`n- Implemented LiveKit DataChannel real-time synced Reactions and Raised Hands

### Fixed
- Re-directed unauthorized or logged-out users to Login instead of Dashboard/Landing page
- Async state bug preventing name from saving to local context variables after Registration (causing ?? in navbar)
- Cleared static/dummy Demo Classrooms from student default dashboard
- Resolved bi-directional video track feeds dropping between Student and Teacher by unnesting Livekit \VideoTrack\ refs
- Fixed missing text/color CSS constraints rendering elements invisible
