# Contributing to APS Editorial Management System

Thank you for your interest in contributing to the APS Editorial Management System! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Security](#security)
- [Questions](#questions)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the project
- Showing empathy towards other contributors

**Unacceptable behavior includes:**
- Harassment, insulting/derogatory comments
- Public or private attacks
- Publishing others' private information
- Other conduct which could be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your local settings
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5173/fr/ in your browser

---

## Development Workflow

### Branch Strategy

We use Git Flow branching model:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Feature Branch

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes

**Examples:**
```bash
feat(auth): add OTP verification flow
fix(articles): resolve publishing date bug
docs(api): update endpoint documentation
refactor(users): simplify user lookup logic
```

---

## Coding Standards

### JavaScript/React

**General Rules:**
- Use functional components with hooks
- Use ES6+ syntax
- Use const/let (never var)
- Use arrow functions for callbacks
- Add JSDoc comments to all functions
- Keep functions small and focused

**Naming Conventions:**
```javascript
// Components - PascalCase
function UserProfile() { }

// Functions/Variables - camelCase
const getUserData = () => { }
const userName = "John";

// Constants - UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5242880;
const API_BASE_URL = "https://api.aps.dz";

// Private functions - _camelCase
const _internalHelper = () => { }

// Files
- Components: PascalCase.jsx (UserProfile.jsx)
- Utilities: camelCase.js (formatDate.js)
- Styles: kebab-case.css (user-profile.css)
```

**Component Structure:**
```javascript
/**
 * Component description
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Title text
 * @returns {JSX.Element}
 */
function MyComponent({ title }) {
  // 1. State declarations
  const [data, setData] = useState([]);
  
  // 2. Context hooks
  const { baseUrl } = useContext(AuthContexte);
  
  // 3. Custom hooks
  const { response, loading, fetchData } = useAxios({...});
  
  // 4. useEffect hooks
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 5. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 6. Render helpers
  const renderItem = (item) => {
    return <div>{item.name}</div>;
  };
  
  // 7. Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}

export default MyComponent;
```

**JSDoc Comments:**
```javascript
/**
 * Validates user email address
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 * 
 * @example
 * isValidEmail("user@aps.dz") // Returns: true
 */
export function isValidEmail(email) {
  const rgx = /@aps\.dz$/;
  return rgx.test(email);
}
```

### CSS

**Style Guidelines:**
- Use CSS Modules when possible
- Use meaningful class names
- Avoid inline styles unless necessary
- Mobile-first approach
- Use CSS variables for theming

```css
/* Good */
.user-profile__header {
  display: flex;
  align-items: center;
}

.user-profile__avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

/* Bad */
.up {
  display: flex;
}
```

### Security Requirements

**Always validate user inputs:**
```javascript
import { checkXssSQL } from '../helpers/Gfunc';

const handleSubmit = (value) => {
  // ✅ REQUIRED: Validate before processing
  if (checkXssSQL(value).isInjection) {
    toast.error('Invalid input detected');
    return;
  }
  
  // Process value
};
```

**Never log sensitive data:**
```javascript
// ❌ BAD
console.log('User password:', password);

// ✅ GOOD
console.log('User login attempt:', username);
```

---

## Pull Request Process

### Before Submitting

1. **Test your changes**
   ```bash
   npm run lint
   npm run build
   ```

2. **Update documentation** if needed

3. **Ensure no console errors** or warnings

4. **Test in multiple browsers** (Chrome, Firefox, Safari)

### Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out PR template

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Tested locally
   - [ ] Tested in dev environment
   - [ ] Unit tests pass
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new warnings
   
   ## Screenshots (if applicable)
   ```

4. **Address Review Comments**
   - Make requested changes
   - Push updates to same branch
   - Respond to comments

### Review Process

- Minimum 1 reviewer approval required
- All CI checks must pass
- No merge conflicts
- Branch must be up to date with develop

---

## Testing Guidelines

### Manual Testing

**Test Checklist:**
- [ ] Feature works as expected
- [ ] No console errors
- [ ] No visual regressions
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] All user roles tested (if applicable)
- [ ] Error states handled gracefully
- [ ] Loading states display correctly
- [ ] Form validation works

### Cross-Browser Testing

Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Proper ARIA labels
- [ ] Color contrast meets standards
- [ ] Focus indicators visible

---

## Documentation

### When to Update Documentation

- Adding new features → Update README.md and relevant docs
- Changing API → Update docs/api.md
- Modifying security → Update docs/security.md
- Database changes → Update docs/database-schema.md

### Documentation Style

- Use clear, concise language
- Include code examples
- Add diagrams where helpful
- Keep formatting consistent
- Update table of contents

---

## Security

### Reporting Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email security@aps.dz with details
2. Include steps to reproduce
3. Suggest fix if possible
4. Allow time for patch before disclosure

### Security Best Practices

- Never commit sensitive data (passwords, tokens, keys)
- Use environment variables for secrets
- Validate all user inputs
- Follow authentication guidelines
- Test for XSS and SQL injection
- Keep dependencies updated

---

## Questions

### Where to Ask

- **Technical Questions**: Create a GitHub Discussion
- **Bug Reports**: Open a GitHub Issue
- **Security Issues**: Email security@aps.dz
- **General Inquiries**: Contact support@aps.dz

### Issue Template

When reporting bugs:

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- Browser: [e.g. Chrome 120]
- OS: [e.g. Windows 11]
- Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information
```

---

## Recognition

Contributors will be recognized in:
- Project README.md
- Release notes
- Project website (if applicable)

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort! 🎉

---

**Questions?** Contact the development team at dev@aps.dz
