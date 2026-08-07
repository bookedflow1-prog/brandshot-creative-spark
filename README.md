# BrandShot Studio

Build a new production-quality SaaS from scratch called:

BRANDSHOT AI

Tagline:

Create. Edit. Transform.

BrandShot AI is an AI-powered creative studio for BOTH personal users and businesses.

Users should be able to:

Upload an image

→ enhance or transform it with AI

→ create professional product/content photography

→ edit designs visually

→ create short videos

→ generate captions

→ export the final content

IMPORTANT:

Do not build social-media publishing or scheduling yet.

The current product ends at EXPORT.

Use Lovable Cloud for:

- Authentication

- Database

- Storage

- Server functions

- Secrets

- User accounts

- Credits

- Admin functionality

==================================================

FIRST PRINCIPLE

==================================================

BrandShot AI must be:

POWERFUL UNDER THE HOOD

SIMPLE ON THE SURFACE

A complete beginner should understand the application within 60 seconds.

Do not make the UI look like developer software.

Do not expose technical terminology unnecessarily.

Do not overload screens with controls.

Use progressive disclosure:

show simple controls first and advanced controls only when needed.

==================================================

TARGET USERS

==================================================

Do not design BrandShot only for businesses.

Support:

- Personal users

- Content creators

- Small businesses

- E-commerce sellers

- Fashion users

- Perfume/cosmetics brands

- Food businesses

- Agencies

- Social-media creators

Use the term:

PROJECTS

instead of forcing everything to be called a Product.

Project types:

- Product

- Personal Photo

- Fashion / Outfit

- Food

- Vehicle

- Artwork

- Social Media

- Other

Use product-specific features only when relevant.

==================================================

CORE EXPERIENCE

==================================================

The main creation flow should be:

CREATE

↓

UPLOAD

↓

CHOOSE WHAT YOU WANT

↓

AI TRANSFORM / DESIGN

↓

EDIT

↓

VIDEO IF NEEDED

↓

EXPORT

Keep this flow obvious throughout the application.

==================================================

DESIGN QUALITY — CRITICAL

==================================================

BrandShot must look like a premium global creative SaaS.

Quality benchmark:

- Apple-level restraint

- Linear-level polish

- Framer-level visual quality

- Canva-level approachability

- Modern premium AI creative products

These are quality references only.

Do NOT copy any company's proprietary UI, branding, layouts, assets or identity.

Create an ORIGINAL BrandShot visual identity.

The website must NOT look like:

- a generic Lovable template

- a cheap AI wrapper

- a crypto dashboard

- a developer admin panel

- a neon AI website

- a purple-gradient startup template

==================================================

BRANDSHOT VISUAL IDENTITY

==================================================

Create a sophisticated premium design system before building individual pages.

LIGHT MODE:

Background:

warm sophisticated off-white rather than harsh pure white.

Primary surfaces:

clean white / warm neutral.

Primary text:

deep near-black / charcoal.

Secondary text:

refined neutral gray.

DARK MODE:

Background:

deep charcoal / near-black rather than flat #000.

Surfaces:

slightly elevated charcoal.

Text:

warm off-white.

ACCENT:

Choose ONE distinctive premium BrandShot accent color.

It must feel:

- sophisticated

- modern

- memorable

- premium

- suitable for a creative platform

Use it strategically for:

- primary CTA

- selected tools

- active navigation

- AI actions

- progress

- important highlights

Create supporting shades automatically.

Do NOT use multiple competing accent colors.

Do NOT cover the interface in gradients.

Subtle controlled gradients may be used only where they materially improve premium presentation.

==================================================

COLOR QUALITY

==================================================

Color must feel intentional.

Avoid:

- excessive purple

- neon blue

- rainbow gradients

- excessive gold

- glowing borders everywhere

- random card colors

- excessive glassmorphism

Premium should come from:

spacing

typography

composition

imagery

motion

contrast

details

not decoration overload.

==================================================

TYPOGRAPHY

==================================================

Create a professional typography system.

Use a premium modern sans-serif for application UI.

Marketing typography may have slightly more personality.

Maintain excellent:

- hierarchy

- readability

- line height

- spacing

- mobile readability

Do not use:

- tiny UI text

- excessive font weights

- five different heading styles

- decorative fonts inside tools

==================================================

MOTION SYSTEM — CRITICAL

==================================================

Animations are a major part of BrandShot's premium feel.

Create a consistent professional motion system.

Animations must feel:

- smooth

- subtle

- intentional

- fast

- expensive

- responsive

NOT:

- playful for no reason

- bouncy everywhere

- slow

- distracting

- exaggerated

- gimmicky

Use motion to communicate hierarchy and state.

==================================================

LANDING PAGE MOTION

==================================================

Use sophisticated animations such as:

- subtle hero entrance sequence

- staggered text reveal

- refined image movement

- soft section reveals

- controlled parallax where appropriate

- elegant before/after interactions

- smooth card entrances

- premium hover interactions

- subtle CTA feedback

Do NOT animate every element.

Do NOT delay content just to show animation.

Do NOT use excessive scroll-jacking.

Scrolling must remain natural.

==================================================

APPLICATION MOTION

==================================================

Use subtle transitions for:

- Sidebar opening

- Mobile navigation

- Modal opening

- Bottom sheets

- Dropdowns

- Tool selection

- Tabs

- Editor panels

- Image loading

- Upload progress

- AI generation states

- Success states

- Page transitions where appropriate

Use shared motion tokens so animations feel consistent.

Prefer transform and opacity animations for performance.

Respect:

prefers-reduced-motion

for accessibility.

==================================================

MICRO-INTERACTIONS

==================================================

Buttons should have refined:

- hover

- pressed

- loading

- disabled

- success

states.

Cards may use very subtle:

- elevation

- scale

- border

- shadow

changes.

Inputs should have premium focus states.

Uploads should have clear drag/drop feedback.

Do not make every hover element jump or scale dramatically.

==================================================

RESPONSIVE FROM DAY ONE

==================================================

Build mobile responsiveness during implementation.

Do NOT build desktop first and patch mobile later.

Test:

320px

375px

390px

430px

768px

1024px

1280px

1440px+

Mobile must feel intentionally designed.

Not compressed desktop.

Use:

- bottom navigation where useful

- drawers

- bottom sheets

- touch-friendly controls

- full-screen creative experiences

- collapsible panels

No horizontal overflow.

==================================================

PUBLIC LANDING PAGE

==================================================

Build a premium landing page.

Navigation:

BrandShot logo

Features

AI Studio

Magic Editor

Video

Pricing

Login

Start Creating

HERO:

Headline:

Turn One Photo Into Content That Looks Professionally Made

Supporting copy:

Create polished photos, designs and videos with AI — without needing professional editing skills.

Primary CTA:

Start Creating Free

Secondary CTA:

See How It Works

Clearly communicate:

5 free AI credits on signup.

Create a premium interactive visual showing:

ORIGINAL

→

AI RESULT

→

EDITABLE DESIGN

→

VIDEO

Do not use fake customer numbers.

Do not use fake reviews.

Do not use fake logos.

Do not use fake revenue statistics.

==================================================

LANDING PAGE SECTIONS

==================================================

Build:

1. Hero

2. Visual transformation demo

3. What can you create?

4. AI Studio

5. Magic Editor

6. Video Studio

7. How it works

8. Personal + Business use cases

9. Free credits explanation

10. Pricing placeholder / coming plans

11. FAQ

12. Final CTA

13. Footer

Use strong visual storytelling rather than walls of text.

==================================================

AUTHENTICATION

==================================================

Implement real Lovable Cloud authentication.

Support:

- Sign up

- Login

- Logout

- Forgot password

- Reset password

- Session persistence

- Protected routes

After signup:

Grant exactly:

5 FREE CREDITS

Do this securely server-side.

Never allow the browser to grant itself credits.

==================================================

ONBOARDING

==================================================

Keep onboarding extremely short.

Screen 1:

What do you want to create?

Options:

Product Photo

Personal Photo

Social Content

Advertisement

Video

Other

Screen 2:

What would you like BrandShot to help with?

Professional photo

Background

Design

AI editing

Video

Everything

Then:

Start Creating

Allow skip.

Do not ask beginners technical questions.

==================================================

MAIN APPLICATION

==================================================

Keep primary navigation simple.

Main navigation:

Home

Create

Projects

Editor

Video

Exports

Secondary / account area:

Brand Kit

Credits

Settings

Do NOT put 15–20 items in the main sidebar.

==================================================

HOME

==================================================

The dashboard should NOT feel like analytics software.

Main heading:

What do you want to create today?

Large visual actions:

AI Photo

Design

Edit Photo

Video

Below:

Recent Projects

Recent Exports

Credit Balance

Do not overwhelm the user with charts.

==================================================

CREATE FLOW

==================================================

When user presses Create:

STEP 1

What are you creating?

- Product

- Personal Photo

- Fashion

- Food

- Vehicle

- Artwork

- Social Content

- Other

STEP 2

Upload image

STEP 3

What do you want to do?

- Make Professional

- Change Background

- Create Advertisement

- Edit Image

- Create Video

- Start from Scratch

STEP 4

Choose style

Use visual cards rather than technical settings.

STEP 5

Generate / Continue Editing

STEP 6

Edit or Export

Allow Back without losing progress.

Autosave where appropriate.

==================================================

AI STUDIO FOUNDATION

==================================================

Create the architecture for AI image operations.

Initial actions:

- Make Professional

- Remove Background

- Change Background

- Enhance Image

- Create Advertisement

Advanced architecture should support later:

- Magic Eraser

- Magic Replace

- Magic Expand

- Magic Grab

Do not tightly couple the application to one AI provider.

Use provider abstractions.

If a real provider is not configured:

show a clear:

AI Provider Not Configured

state.

Do not fake successful generations.

==================================================

PRODUCT PRESERVATION

==================================================

For Product projects:

Preserve:

- product shape

- logo

- label

- packaging

- colors

- proportions

- printed details

Prefer:

original product isolation

+

new/generated environment

+

compositing

rather than unnecessarily regenerating the complete product.

Never knowingly invent packaging text.

==================================================

MAGIC EDITOR FOUNDATION

==================================================

Build a Canva-style but original beginner-friendly editor.

Prefer Fabric.js if compatible.

Support:

- Image

- Text

- Shapes

- Background

- Logo

- Layers

- Move

- Resize

- Rotate

- Duplicate

- Delete

- Lock

- Opacity

- Alignment

- Undo

- Redo

- Autosave

- Export

Store editable projects as structured data, not only flattened images.

==================================================

EDITOR UX

==================================================

Do not show every control at once.

When nothing is selected:

show:

Add Text

Add Image

Background

Elements

AI Tools

When text selected:

show only text controls.

When image selected:

show only image controls.

Advanced settings:

More Options

Use progressive disclosure.

==================================================

PROTECTED PRODUCT LAYER

==================================================

Product projects should automatically create a protected product layer.

Default:

- locked proportions

- no distortion

- no destructive filters

- move allowed

- scale allowed

- rotation allowed

- safe shadow allowed

Require confirmation before destructive modification.

==================================================

IMAGE TO EDITABLE ARCHITECTURE

==================================================

Prepare architecture for:

Convert to Editable Design

Future/available processing may detect:

- foreground

- background

- text

- logos

- graphic elements

Use OCR and segmentation where configured.

Do not claim perfect layer reconstruction.

Low-confidence regions should remain raster elements.

==================================================

VIDEO STUDIO FOUNDATION

==================================================

Build a beginner-friendly Video Studio.

Do NOT implement social publishing.

Workflow:

Choose images/designs

→ choose template

→ arrange scenes

→ customize

→ preview

→ export

Formats:

9:16

1:1

4:5

16:9

Templates:

Luxury Reveal

Minimal

Slideshow

Sale

New Arrival

Before / After

Feature Highlights

Support:

- scene ordering

- duration

- text

- price

- logo

- CTA

- transitions

- simple animations

- music

- volume

Prefer an open-source rendering architecture such as FFmpeg where technically suitable.

Do not fake successful MP4 rendering if rendering infrastructure is unavailable.

==================================================

EXPORT SYSTEM

==================================================

Images:

PNG

JPG

WebP

Transparent PNG

Presets:

1:1

4:5

9:16

16:9

Original

Custom

Videos:

MP4

Provide appropriate quality/resolution settings.

Exports should be stored in the user's private Content/Export Library.

==================================================

CREDITS

==================================================

Every new user:

5 FREE CREDITS

Manual editing must remain free.

FREE:

- Text editing

- Move

- Resize

- Rotate

- Shapes

- Layer management

- Undo/redo

- Basic manual design work

Credits are used only for AI or meaningful compute-intensive operations.

Every AI operation must cost at least:

1 credit

More expensive operations may cost more depending on:

- model

- resolution

- outputs

- complexity

- video duration

- render quality

Credit prices must be configurable from Admin.

Do not scatter hardcoded credit values throughout frontend components.

==================================================

CREDIT TRANSACTIONS

==================================================

All credit logic must be server-side.

Before AI operation:

calculate cost

→ show cost

→ verify balance

→ reserve/deduct

→ run operation

→ confirm success

If provider/system operation fails:

refund appropriately.

Prevent:

- negative balances

- duplicate charges

- replay charges

- client-side balance modification

Maintain a credit transaction ledger.

==================================================

PROJECTS

==================================================

Create project management.

Each project can contain:

- Original assets

- AI results

- Editable designs

- Video projects

- Exports

Actions:

Open

Rename

Duplicate

Delete

Use clear thumbnails.

==================================================

CONTENT / EXPORT LIBRARY

==================================================

Store:

- Originals

- Generated images

- Designs

- Videos

- Exports

Allow:

Preview

Edit

Duplicate

Download

Rename

Delete

Keep user media private.

==================================================

BRAND KIT

==================================================

Optional for personal users.

Useful for businesses/creators.

Store:

- Brand name

- Logo

- Colors

- Fonts

- Tagline

- Contact details

Integrate into Editor and Video Studio.

==================================================

DATABASE

==================================================

Design a clean scalable schema for:

profiles

user_roles

projects

project_assets

brand_kits

generations

design_projects

design_versions

design_assets

ai_jobs

video_projects

video_scenes

video_assets

exports

credit_transactions

app_settings

admin_audit_logs

Use proper:

- UUIDs

- foreign keys

- timestamps

- constraints

- indexes

Create versioned migrations.

==================================================

STORAGE

==================================================

Use private Lovable Cloud storage.

Use owner-based paths.

Example:

{auth.uid()}/{project_id}/{asset_id}

Support:

- safe filenames

- MIME validation

- size validation

- signed URLs

- private access

Do not hardcode developer UUIDs or emails.

==================================================

RLS AND SECURITY

==================================================

Enable RLS for all private user tables.

User A must NEVER access User B:

- projects

- media

- designs

- videos

- exports

- credit history

- private profile data

Never trust user_id from frontend.

Use authenticated identity server-side.

Users must never:

- grant themselves credits

- grant themselves admin

- edit another user's assets

- access private storage

- change system credit pricing

Admin authorization must be server-side.

==================================================

UPLOAD RELIABILITY

==================================================

Uploads must work for every authenticated user.

Test using at least:

User A

User B

Both must upload successfully.

Neither may access the other's private files.

Handle:

- invalid files

- large files

- duplicate names

- network errors

- upload interruption

Show beginner-friendly errors.

Never expose raw RLS/storage errors to users.

==================================================

ADMIN

==================================================

Create a secure admin area.

Admin can manage:

- Users

- Credits

- AI operation costs

- Generations

- Storage/usage overview

- Feature flags

- System settings

Do not expose secrets.

All admin actions require server-side role verification.

==================================================

PERFORMANCE

==================================================

Optimize:

- route loading

- images

- thumbnails

- canvas memory

- large uploads

- signed URLs

- database queries

- mobile performance

Use editing proxies for very large images when necessary.

Preserve original-resolution assets for final export.

==================================================

ACCESSIBILITY

==================================================

Support:

- keyboard navigation

- visible focus states

- proper labels

- strong contrast

- touch targets

- reduced motion

- semantic HTML

==================================================

SEO

==================================================

Public marketing pages:

- titles

- descriptions

- OpenGraph

- favicon

- sitemap

- robots

Private app/dashboard pages:

do not index.

==================================================

TESTING

==================================================

Continuously:

ANALYZE

→ IMPLEMENT

→ TYPECHECK

→ BUILD

→ TEST

→ AUDIT

→ FIX

→ RETEST

Do not stop after each phase asking for approval.

Test:

- Signup

- 5-credit grant

- Login/logout

- Project creation

- Upload

- Multi-user storage

- AI provider states

- Credit deductions

- Failed-operation refunds

- Editor

- Save/load

- Export

- Video project

- Responsive behavior

- RLS

- Admin authorization

==================================================

BEGINNER TEST

==================================================

Final usability test:

A completely new user opens BrandShot on a phone.

They want to turn one ordinary image into professional content.

Without documentation they should understand how to:

Register

→ Upload

→ Choose goal

→ Create

→ Edit

→ Export

If not:

SIMPLIFY THE INTERFACE.

Do not solve confusion by adding more explanatory text.

Prefer removing complexity.

==================================================

OPEN-SOURCE FIRST

==================================================

Prefer appropriate open-source components for the MVP where licensing permits.

Before copying source code from any repository:

- inspect LICENSE

- verify commercial use

- document attribution requirements

- avoid code with unclear licensing

Use external repositories as architectural inspiration when direct reuse is not clearly licensed.

Keep paid external dependencies minimal.

==================================================

DO NOT BUILD YET

==================================================

Do NOT implement:

- Facebook publishing

- Instagram publishing

- TikTok publishing

- Social OAuth

- Post scheduling

- Social analytics

- Team workspaces

- Enterprise features

Keep scope focused.

==================================================

AUTONOMOUS EXECUTION

==================================================

Do not stop after planning.

Do not repeatedly ask:

"Should I continue?"

Continue autonomously unless genuinely blocked by:

- missing external credentials

- unavailable external service

- destructive action requiring owner confirmation

If an external AI/video provider is missing:

finish the surrounding architecture and clearly mark that integration as Not Configured.

Do not fabricate successful integration tests.

==================================================

FINAL QUALITY BAR

==================================================

Before declaring completion:

Audit the application as if it were being submitted for a premium global SaaS launch.

Check:

- visual quality

- animation quality

- consistency

- beginner usability

- mobile experience

- loading states

- empty states

- error states

- accessibility

- security

- performance

- responsive layouts

- broken buttons

- dead routes

- fake data

- debug code

No fake testimonials.

No fake statistics.

No fake AI results.

No dead buttons.

No unfinished production-critical flows.

The final application should feel SIMPLE enough for a beginner and PREMIUM enough that a paying customer trusts it.

Start by creating the BrandShot design system and architecture, then implement the complete foundation without stopping.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/be7014f3-33e4-49f9-8c00-9a167b957fea).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
