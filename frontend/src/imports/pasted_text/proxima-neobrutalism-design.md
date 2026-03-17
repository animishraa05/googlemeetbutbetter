Here is the prompt:

```
Design a neobrutalism web app called Proxima — a real-time WebRTC classroom platform for students and teachers.

STYLE: Neobrutalism. Raw, bold, intentional. Inspired by Gumroad, Figma's brand refresh, and Halo Lab's "Look Beyond Limits". Think nostalgic 90s energy meets modern UI. Nothing is soft, nothing is blurred, everything has weight.

COLOR PALETTE:
Page background: #FFFBE6 (warm cream — the signature neobrutalism background)
Primary surface / cards: #FFFFFF
Black (borders, shadows, text): #000000
Primary accent: #FF6B35 (bold orange — main CTA buttons, active states)
Secondary accent: #7B61FF (electric purple — student role, join actions)
Highlight yellow: #FFD600 (badges, live indicators, raised hand, hover fills)
Success green: #00C851 (got it reaction, online status, positive scores)
Alert red: #FF3D57 (confused reaction, error states, low attention score)
Info blue: #0085FF (teacher role, info badges, screen share)
All text on colored backgrounds: #000000

BORDER RULE:
Every single element has border: 2px solid #000000. No exceptions. Cards, buttons, inputs, video tiles, sidebars, tabs, badges, everything. This is the single most important rule of neobrutalism.

SHADOW RULE:
Every card and button has a hard offset box shadow: 4px 4px 0px #000000. No blur, no spread, purely offset. Pressed/active state reduces to 2px 2px 0px #000000 and shifts the element 2px down and right to simulate a press. Inputs do not have shadows, only borders.

TYPOGRAPHY:
Headings: Space Grotesk Bold. Oversized and commanding. Hero text 56px, section headings 32px, card titles 20px.
Body and labels: Inter Regular 15px.
Metadata, tags, counts: Space Mono 12px uppercase with letter spacing.
All text is #000000 on light backgrounds. White text only on pure black fills.
No italic. No thin weights. Bold or regular only.

BORDER RADIUS:
Maximum 6px on everything. Neobrutalism stays sharp. Buttons 4px, cards 6px, inputs 4px, badges 4px. No pill shapes, no circles except avatars.

SPACING:
Generous padding inside cards: 24px minimum. Gap between elements: 16px. Section gaps: 48px. Everything breathes but stays structured.

DECORATIVE RULES:
Thick horizontal rules (3px solid black) between sidebar sections.
Tab active states use yellow fill (#FFD600) with black text and no shadow.
Dashed borders (2px dashed #000000) for additive actions like New Class.
Progress bars are flat rectangles with black border, colored fill, no radius.
Live indicator is a filled circle in green (#00C851) with a black border, no pulse animation.

5 PAGES TO DESIGN:

PAGE 1 — LOGIN
Full width split layout. Left half: cream background (#FFFBE6). Giant PROXIMA wordmark in Space Grotesk Bold 72px black, left aligned. Below: one line tagline "Real-time classroom. Built on WebRTC." in Inter 18px. Below that: three stat chips in a row — each chip has white background, 2px black border, 4px 4px 0px black shadow. Chip 1: "WebRTC" in orange. Chip 2: "AI Detection" in purple. Chip 3: "Live Annotation" in blue. Bottom left: small note "Used by 4 team members at IET hackathon."
Right half: white background with 2px left black border. Centered form card — white, 2px black border, 6px 6px 0px black shadow, 32px padding. Card heading: "Sign in" 32px bold. Subtext: "Enter your details below" in muted gray. Email input full width, password input full width. Both have 2px black border, 4px radius, 48px height. Sign in button: full width, 48px height, orange background (#FF6B35), black text bold, 2px black border, 4px 4px 0px black shadow. Below button: "No account? Register" link in purple underlined.

PAGE 2 — REGISTER
Same split layout as login. Right card: "Create account" heading. Name, email, password inputs stacked. Below password: "I am joining as" label in Space Mono uppercase. Two role cards side by side in a 2-column grid. Student card: white bg, 2px black border, 4px shadow. Inside: large "S" or student icon, "Student" in 18px bold, "Join live classes" in 13px muted. Teacher card: same structure but says "Teacher" and "Host live classes". Selected card gets yellow fill (#FFD600) background with black border kept, shadow removed (pressed state). Create account button: full width purple (#7B61FF), white text bold, 2px black border, 4px shadow.

PAGE 3 — LANDING (post login, choose action)
Navbar: cream background, full width, 2px bottom black border. Left: PROXIMA wordmark 24px bold. Right: user avatar (circle, 2px black border, initials inside in bold), user name, role badge (orange chip for teacher, purple for student), logout link.
Main content centered, max width 860px, padding top 80px. Big heading: "What do you want to do today?" in Space Grotesk Bold 48px. Below: two equal cards side by side with 24px gap. Both cards white, 2px black border, 8px 8px 0px black shadow, 32px padding, 6px radius.
Left card — teacher only: orange top accent bar (4px solid orange at top of card). Title: "Start a class" 22px bold. Subtitle: "Create a live session for your students" muted. Class name input below. Big orange button "Create and start" full width at bottom.
Right card: purple top accent bar. Title: "Join a class" 22px bold. Subtitle: "Enter the room code your teacher shared" muted. Room code input below. Big purple button "Join class" full width at bottom.

PAGE 4 — TEACHER ROOM
Top bar: white background, 2px bottom black border, 56px height. Left: PROXIMA wordmark small. Center: scrollable tab row. Each tab is a chunky button, 2px black border, 4px shadow, white background, Space Grotesk 13px bold. Active tab: yellow background (#FFD600), black text, no shadow (pressed). New Class tab: white background, 2px dashed black border, orange text "Plus New Class".
Main area: two column layout. Left column flex 1: stacked rows.
Top section: screen share panel. White background, 2px black border, 4px shadow. Tall rectangle taking up 55% of the column height. Inside center: "Screen share area" placeholder in muted. Top right corner inside: annotation toolbar as a white strip with 2px black border containing three color swatches (circles with black border), a thickness toggle button, and a clear all button. All toolbar buttons have 2px black border. Bottom left inside: two action buttons — "Share screen" in blue, "Mute all" in white — both with black border and shadow.
Bottom section: 4 student video tiles in a row. Each tile white background, 2px black border, 4px 4px 0px black shadow. Inside: muted person icon, name label at bottom left in Space Mono 10px, green live dot top right. Raised hand shows yellow badge "Hand" top left.
Right column: fixed 260px sidebar. White background, 2px left black border. 16px padding inside.
Section 1: "LIVE REACTIONS" in Space Mono 10px uppercase black, 3px bottom black rule below heading. Four rows: Got it, Confused, Too fast, Repeat. Each row: label left in Inter 14px, count right in Space Mono bold inside a white chip with 2px black border. Confused count in red chip, others in default.
3px solid black horizontal rule between sections.
Section 2: "ENGAGEMENT" same style heading. Per student row: name in Inter 13px, percentage right in Space Mono bold colored (green above 70, yellow 40-70, red below 40). Below name row: full width flat progress bar, 8px height, 2px black border, colored fill matching percentage color, zero border radius.
3px solid black horizontal rule.
Section 3: "RAISED HANDS" heading. Each raised hand student name in a yellow chip (#FFD600), black text, 2px black border, Space Mono 12px.

PAGE 5 — STUDENT ROOM
Top bar: same as teacher but no tabs. Shows room name left, live green dot with "Live" text, student count badge.
Main area: full height video area. White background, 2px black border. Teacher video fills this area. Top left overlay: teacher name in a white chip with 2px black border, orange "Teacher" badge next to it. Bottom right: student own PiP tile, 180px wide, 2px black border, 4px 4px 0px black shadow, yellow top bar 4px indicating it is you.
Bottom bar: white background, 2px top black border, 64px height, horizontal flex row, 12px padding. Four reaction buttons: Got it (green border and text), Confused (red border and text), Too fast (orange border and text), Repeat (blue border and text). All buttons: 2px colored border, 4px 4px 0px black shadow, white background, Space Grotesk 13px bold, 36px height, 16px horizontal padding. Hover state: colored background, black text. Raise Hand button far right: yellow background (#FFD600), black text bold, 2px black border, 4px 4px 0px black shadow, "Raise Hand" label. When active: pressed state 2px shadow, shifted position.

COMPONENT CONSISTENCY:
Every interactive element has a hover state that fills it with yellow (#FFD600) and keeps the black border.
Every active/pressed element shifts 2px down-right and reduces shadow to 2px 2px 0px.
All badges and chips use Space Mono font.
All form labels use Inter 13px muted gray (#666666).
No gradients anywhere. No blur anywhere. No rounded pills anywhere except avatars.
```