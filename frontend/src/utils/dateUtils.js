/**
 * Utility function to format ISO date strings / Date objects into readable relative timestamps
 * @param {string|Date|number} timestamp
 * @returns {string} Relative time string (e.g., "Just now", "2 minutes ago", "3 hours ago", "Today, 10:30 AM", "Yesterday", "12 May 2026")
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just now';

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Just now';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // Future timestamp fallback
  if (diffInSeconds < 0) return 'Just now';

  // Less than 60 seconds
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Less than 60 minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  }

  // Less than 24 hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    // Check if same calendar day
    const isSameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isSameDay) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    }
  }

  // Check if Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (isYesterday) {
    return `Yesterday, ${formattedTime}`;
  }

  // Same calendar day beyond hours diff fallback
  const isSameCalendarDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameCalendarDay) {
    return `Today, ${formattedTime}`;
  }

  // Older dates: e.g. "12 May 2026"
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return formattedDate;
};
