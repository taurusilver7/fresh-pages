# Fresh Pages

> A Fully Server-Side Writing Platform with Multi-Chapter Story Support

A Node.js/Express CRUD application for creative writers to compose, manage, and share multi-chapter stories. Built with server-side rendering using Handlebars, Google OAuth authentication, and a rich WYSIWYG editor.

![fresh-pages](https://i.ibb.co/SxLMzBM/fresh-pages.png)

## Features

### 📝 Multi-Chapter Story Management
- Create stories with unlimited chapters
- Rich text editing with CKEditor WYSIWYG editor
- Chapter-based navigation with prev/next controls
- Dynamic chapter tabs for easy editing
- Auto-save chapter content during editing

### 🎨 Advanced Reader Experience
- **Customizable Reading Interface**:
  - Font size adjustment (A-, A, A+)
  - Line spacing toggle (3 presets: 1.5, 1.95, 2.4)
  - Font family cycling (5 reader-optimized fonts: Georgia, Helvetica, Palatino, Segoe UI, Merriweather)
  - Dark mode toggle with persistent preferences
- **Chapter Navigation**: Query-based chapter viewing (`?chapter=N`)
- **Responsive Layout**: Optimized for reading with max-width constraints

### 🔐 Authentication & Authorization
- Google OAuth 2.0 authentication via Passport.js
- Session persistence with MongoDB store (connect-mongo)
- Route protection middleware (`ensureAuth`, `ensureGuest`)
- User-specific story ownership validation

### 📚 Story Features
- **Visibility Control**: Public/Private story status
- **Story Metadata**: Title, description, creation date, chapter count
- **User Dashboard**: Personal story library with edit/delete actions
- **Public Story Feed**: Browse all public stories from the community
- **User Profiles**: View stories by specific authors

### 🎯 Data Models

**User Schema**:
- Google ID, display name, first/last name
- Profile image
- Creation timestamp

**Story Schema**:
- Title, description, status (public/private)
- Chapters array with embedded ChapterSchema
- User reference (author)
- Creation timestamp

**Chapter Schema** (embedded):
- Chapter number (auto-incremented)
- Title (defaults to "Chapter N")
- Content (rich HTML from CKEditor)

## Tech Stack

### Backend
- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Template Engine**: Handlebars (express-handlebars)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js + passport-google-oauth20
- **Session Store**: connect-mongo (v3.2.0)

### Frontend
- **UI Framework**: Materialize CSS
- **Icons**: Font Awesome
- **Editor**: CKEditor 4.16.0 (WYSIWYG)
- **Date Formatting**: Moment.js
- **Dark Mode**: Custom CSS with localStorage persistence

### Development Tools
- **Process Manager**: Nodemon
- **Environment Variables**: dotenv
- **HTTP Method Override**: method-override (for PUT/DELETE in forms)
- **Logging**: Morgan (development mode)
- **Testing**: Jest + Supertest

## Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- MongoDB instance (local or cloud)
- Google Cloud Console project with OAuth 2.0 credentials

### Environment Configuration

Create `config/config.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_APPLICATON_URL=mongodb://localhost:27017/fresh-pages
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
6. Copy Client ID and Client Secret to `config.env`

### Install Dependencies

```bash
npm install
```

### Run Application

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start

# Run tests
npm test
```

## Application Architecture

### MVC Structure

```
server/
├── app.js                 # Express app configuration
├── server.js              # Server listener
├── config/
│   ├── config.env         # Environment variables
│   ├── db.js              # MongoDB connection
│   └── passport.js        # Passport Google Strategy
├── controller/
│   └── auth.js            # Authentication middleware
├── models/
│   ├── User.js            # User schema
│   └── Story.js           # Story & Chapter schemas
├── routes/
│   ├── index.js           # Landing & dashboard routes
│   ├── auth.js            # OAuth routes
│   └── stories.js         # Story CRUD routes
├── views/
│   ├── layouts/           # Main & login layouts
│   ├── partials/          # Reusable components
│   ├── stories/           # Story templates
│   └── error/             # Error pages (404, 500)
├── utils/
│   └── hbs.js             # Handlebars helpers
└── public/
    ├── css/               # Custom stylesheets
    └── [images]           # Static assets
```

### Key Middleware Configuration

**Body Parsers**:
```javascript
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
```

**Method Override** (for PUT/DELETE in HTML forms):
```javascript
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === "object" && "_method" in req.body) {
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}));
```

**Session Management**:
```javascript
app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
```

### Handlebars Helpers

Custom helpers registered in `app.js`:

- **formatDate**: Format dates using Moment.js (`MMM Do YYYY`)
- **stripTags**: Remove HTML tags from content
- **truncate**: Limit text length with ellipsis
- **editIcon**: Conditional edit button for story owners
- **select**: Pre-select dropdown options
- **json**: Serialize objects for client-side JavaScript

## API Routes

### Authentication Routes (`/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Initiate Google OAuth flow |
| GET | `/auth/google/callback` | OAuth callback handler |
| GET | `/auth/logout` | Logout and destroy session |

### Main Routes (`/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Landing/login page | Guest only |
| GET | `/dashboard` | User's story dashboard | Required |

### Story Routes (`/stories`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stories` | Browse all public stories | Required |
| GET | `/stories/add` | Story creation form | Required |
| POST | `/stories` | Create new story | Required |
| GET | `/stories/:id` | View single story (with `?chapter=N`) | Required |
| GET | `/stories/edit/:id` | Edit story form | Owner only |
| PUT | `/stories/:id` | Update story | Owner only |
| DELETE | `/stories/:id` | Delete story | Owner only |
| GET | `/stories/user/:userId` | View user's public stories | Required |

## Application Workflow

### 1. User Authentication Flow

```
Landing Page (/) 
  → Click "Login with Google"
  → /auth/google (Passport initiates OAuth)
  → Google consent screen
  → /auth/google/callback (Passport verifies)
  → User created/retrieved from DB
  → Session established
  → Redirect to /dashboard
```

### 2. Story Creation Flow

```
Dashboard → "Write your first story" / "Add Story" button
  → /stories/add (Form with chapter tabs)
  → User fills: Title, Description, Status
  → User adds chapters via tab interface
  → CKEditor for rich text content
  → Submit form (POST /stories)
  → Parallel arrays (chapterTitles[], chapterContents[]) processed
  → Story document created with embedded chapters
  → Redirect to /dashboard
```

**Chapter Data Processing**:
```javascript
// Client-side: Hidden inputs populated on submit
chapters.forEach(ch => {
  <input name="chapterTitles[]" value="ch.title">
  <input name="chapterContents[]" value="ch.content">
});

// Server-side: Rebuild chapter objects
const chapters = chapterTitles.map((title, index) => ({
  chapterNumber: index + 1,
  title: title || `Chapter ${index + 1}`,
  content: chapterContents[index] || ""
}));
```

### 3. Story Reading Flow

```
Public Stories (/stories) or Dashboard
  → Click story card
  → /stories/:id (defaults to chapter 1)
  → Reader interface loads with:
    - Story metadata banner
    - Chapter navigation bar
    - Reader customization controls
    - Chapter content
    - Pagination controls
  → Navigate: /stories/:id?chapter=2, ?chapter=3, etc.
```

**Reader Preferences** (localStorage):
```javascript
{
  fontSize: 1.08,        // rem units (0.8 - 1.6)
  spacing: 1.95,         // line-height (1.5, 1.95, 2.4)
  fontFamily: 'georgia', // 5 font options
  darkMode: false        // boolean
}
```

### 4. Story Editing Flow

```
Dashboard → Click "Edit" on story card
  → /stories/edit/:id
  → Ownership validation (user.id === story.user)
  → Form pre-populated with story data
  → Chapters loaded from __STORY_CHAPTERS__ global
  → User modifies content
  → Submit (PUT /stories/:id via method-override)
  → Chapters array rebuilt from form data
  → Story updated with findByIdAndUpdate
  → Redirect to /dashboard
```

### 5. Authorization Logic

**Route Protection**:
- `ensureAuth`: Redirects unauthenticated users to `/`
- `ensureGuest`: Redirects authenticated users to `/dashboard`

**Ownership Validation** (edit/delete):
```javascript
if (story.user.toString() !== req.user.id) {
  return res.redirect("/stories");
}
```

**Private Story Access**:
```javascript
if (story.status === "private") {
  if (!req.user || req.user.id !== story.user._id.toString()) {
    return res.render("error/404");
  }
}
```

## Client-Side Features

### Dark Mode Implementation

**Scope**: Applies to dashboard, story forms, and reader interface

**Persistence**: `localStorage` key `fp_reader_prefs`

**Targets**:
- Body element
- Story wrappers
- CKEditor iframe (injected stylesheet)

### CKEditor Configuration

**Plugins**: 
- Core: wysiwygarea, toolbar, basicstyles, clipboard
- Formatting: format, font, blockquote, justify, list, indent
- Advanced: codesnippet, horizontalrule, pagebreak, find, maximize

**Dark Mode Support**: 
- Injects `/css/editor-dark.css` into editor iframe on `instanceReady`

**Content Sync**:
- `editor.getData()` retrieves HTML content
- `editor.updateElement()` syncs to textarea before submit

### Chapter Tab Management

**State Management**:
```javascript
const chapters = [{ title: '', content: '' }];
let activeIndex = 0;
```

**Operations**:
- **Add Chapter**: Push new object, switch to new tab
- **Remove Chapter**: Splice array, adjust activeIndex
- **Switch Tab**: Save current, load target chapter into editor
- **Live Title Update**: Input event updates tab label

**Submit Process**:
1. `saveActive()` - Flush editor content to chapters array
2. `updateElement()` - Sync CKEditor to textarea
3. Generate hidden inputs for each chapter
4. Submit form with complete chapter data

## Error Handling

### Error Pages

- **404**: Story not found or unauthorized access
- **500**: Database errors, server failures
- **401**: Unauthorized access (redirects)

### Error Scenarios

| Scenario | Response |
|----------|----------|
| Story not found | Render `error/404` |
| Database connection failure | Log error, exit process |
| Unauthorized edit attempt | Redirect to `/stories` |
| Private story access by non-owner | Render `error/404` |
| Session expired | Redirect to `/` (login) |

## Testing

**Framework**: Jest + Supertest

**Test Files**:
- `tests/hbs.test.js` - Handlebars helper unit tests
- `tests/stories.test.js` - Story route integration tests

**Run Tests**:
```bash
npm test
```

## Deployment

### Production Checklist

1. **Environment Variables**:
   - Set `NODE_ENV=production`
   - Update `DATABASE_APPLICATON_URL` to production MongoDB
   - Add production domain to Google OAuth redirect URIs

2. **Security**:
   - Change session secret in production
   - Enable HTTPS
   - Set secure cookie flags

3. **Performance**:
   - Enable MongoDB connection pooling
   - Configure CDN for static assets
   - Implement rate limiting

### Deploy on Render

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `config.env`
6. Update Google OAuth redirect URI with Render domain

**Live Demo**: [fresh-pages.onrender.com](http://fresh-pages.onrender.com/)

## Future Enhancements

- [ ] Story categories/genres
- [ ] Search and filtering
- [ ] Comments and reactions
- [ ] Reading progress tracking
- [ ] Export stories (PDF, EPUB)
- [ ] Collaborative writing
- [ ] Story analytics (views, reads)
- [ ] Mobile app

## License

MIT

## Author

taurusilver7
