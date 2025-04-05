# GitHubFolio - Developer Portfolio Generator

GitHubFolio is a modern, sleek application that transforms your GitHub profile into a beautiful portfolio website in seconds. Simply enter your GitHub username, and GitHubFolio will generate a personalized portfolio showcasing your projects, skills, and activity.

![GitHubFolio](https://raw.githubusercontent.com/username/github-profile-analyzer/main/public/screenshot.png)

## ✨ Features

- **Instant Portfolio Creation**: Generate a professional portfolio with just your GitHub username
- **Project Showcase**: Automatically highlights your best work with beautiful project cards
- **Activity Visualization**: View your commit history and activity patterns with interactive charts
- **Repository Statistics**: Analyze language usage, stars, and forks across your repositories
- **Similar Developer Discovery**: Find and connect with developers who share your interests
- **Responsive Design**: Looks great on all devices - mobile, tablet, and desktop
- **Dark Theme**: A sleek, modern dark interface for optimal viewing
- **GitHub API Integration**: Uses GitHub's API to fetch and display your latest data

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/github-profile-analyzer.git
   cd github-profile-analyzer
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 💡 Usage

1. On the homepage, enter your GitHub username in the input field.
2. Click "Create My Portfolio" to generate your portfolio.
3. Your portfolio will be created at `http://localhost:3000/yourusername`.
4. Explore different sections: Projects, Contact info, and more.
5. Optionally, add a GitHub personal access token to increase API rate limits.

## 📦 Project Structure

```
├── app/                      # Next.js app directory
│   ├── [username]/           # Dynamic routes for user profiles
│   │   ├── projects/         # Projects page
│   │   ├── contact/          # Contact page
│   ├── page.tsx              # Home page
│   └── layout.tsx            # Root layout
├── components/               # Reusable UI components
├── public/                   # Static assets
├── types.ts                  # TypeScript interfaces
└── package.json              # Dependencies and scripts
```

## 🔧 Technologies Used

- **Next.js**: React framework for the frontend
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Responsive charting library
- **GitHub API**: Data source for user information

## 📈 GitHub API Rate Limits

- **Unauthenticated requests**: 60 requests per hour
- **Authenticated requests**: 5,000 requests per hour

To increase your rate limit, you can add a GitHub personal access token in the application. The token will be stored in your browser's localStorage and used for API requests.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [GitHub API](https://docs.github.com/en/rest) for providing the data
- [Next.js](https://nextjs.org/) for the awesome framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Recharts](https://recharts.org/) for data visualization
- All the awesome developers using GitHubFolio!

---

Created with ❤️ by [Harsh Rawat](https://github.com/Harshrawat27)
