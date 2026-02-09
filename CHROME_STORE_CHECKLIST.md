# Chrome Web Store Publication Checklist

## ✅ Pre-Publication Requirements

### 1. Developer Account
- [ ] Chrome Web Store Developer account created
- [ ] $5 one-time registration fee paid
- [ ] Account verified (takes a few hours)

### 2. Extension Assets

#### Required Screenshots (1280x800 or 640x400)
- [ ] At least 1 screenshot (up to 5 recommended)
- [ ] Located in: `public/screenshots/`
- [ ] Show key features in action

#### Icons (Already have these ✅)
- [x] 16x16 icon
- [x] 48x48 icon  
- [x] 128x128 icon

#### Store Listing Images (Optional but recommended)
- [ ] Small promo tile: 440x280
- [ ] Large promo tile: 920x680
- [ ] Marquee promo tile: 1400x560

### 3. Legal & Content

#### Required Text Content
- [ ] Short description (132 characters max)
- [ ] Detailed description (what it does, features, how to use)
- [ ] Privacy Policy URL (required if extension handles user data)
- [ ] Support email or website

#### Legal Requirements
- [ ] Privacy policy created and hosted
- [ ] Terms of service (if applicable)
- [ ] Permissions justified in description

### 4. Code Quality
- [x] Extension builds without errors
- [x] No console.log spam
- [x] Tested on multiple websites
- [ ] Remove any test/debug code
- [ ] Code passes Chrome Web Store review policies

### 5. Manifest Requirements
- [x] manifest.json is valid
- [x] Version number set (0.1.0)
- [x] All required fields present
- [x] Permissions clearly described
- [ ] No unnecessary permissions

## 🚨 Chrome Web Store Policies to Check

### Content Policies
- [ ] Single purpose (clearly defined)
- [ ] No spam, malware, or deceptive behavior
- [ ] Respects user privacy
- [ ] No copyright violations
- [ ] Appropriate content rating

### Permission Policies
- [ ] Request minimum permissions needed
- [ ] Explain why each permission is needed
- [ ] Don't request broad host permissions without justification
- [ ] activeTab is preferred over <all_urls> when possible

### User Data & Privacy
- [ ] Privacy policy covers data collection
- [ ] Users control their API keys
- [ ] No data sent to external servers (except AI providers)
- [ ] Clear about what data is shared with AI
- [ ] Secure handling of sensitive data

### API Key Handling
- [ ] Users provide their own API keys
- [ ] Keys stored locally only
- [ ] Clear instructions for obtaining keys
- [ ] No hardcoded API keys in extension

## 📋 Review Timeline
- Initial review: 1-3 business days (sometimes up to 1 week)
- Updates: Usually 1-2 days
- Rejections: Can appeal or fix and resubmit

## 🎯 Post-Publication
- [ ] Monitor reviews and ratings
- [ ] Respond to user feedback
- [ ] Set up analytics (optional)
- [ ] Plan update schedule
