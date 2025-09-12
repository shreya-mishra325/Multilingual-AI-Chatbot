export default function Footer() {
  return (
    <footer className="text-center py-6 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 mt-6">
      © {new Date().getFullYear()} FarmAssist. All rights reserved.
    </footer>
  );
}
