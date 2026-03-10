// This script should be run in the browser console to clear cache and update profile
console.log('Clearing frontend cache and updating admin profile...');

// Clear old localStorage data
localStorage.removeItem('auth_user');
localStorage.removeItem('profile_photo_17');

// Set updated admin data
const updatedAdmin = {
  id: 17,
  name: "Sophy",
  email: "sophy@gmail.com",
  role: "admin",
  profile_image: "http://localhost:3001/uploads/profiles/user_34_1772776507258.png"
};

localStorage.setItem('auth_user', JSON.stringify(updatedAdmin));
localStorage.setItem('profile_photo_17', updatedAdmin.profile_image);

// Trigger profile update events
window.dispatchEvent(new Event('profile-photo-updated'));
window.dispatchEvent(new Event('profile-updated'));

console.log('✅ Admin profile updated in localStorage');
console.log('Updated data:', updatedAdmin);
console.log('Please refresh the page to see the new profile picture!');
