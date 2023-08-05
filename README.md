# CCAPDEV-MCO2

Group Members:
Cabrera, Alyana
Fallarme, Sophia
Ogatia, Graham
Yao, Benson 

DLSU Food Review Web Application

Description:
DLSU Food Review is a web application that allows users to review and discover food establishments around the De La Salle University (DLSU) campus. Users can explore different restaurants and cafes, read reviews, and post their own reviews based on their dining experiences. The application aims to provide a platform for the DLSU community to share their thoughts and recommendations on various food establishments.

Features:
View Establishments: Upon visiting the web page, users can see a list of featured establishments near the DLSU campus. Each establishment's overall rating and a brief description are easily accessible from the list.

View Establishment Reviews: Users can select an establishment to view its top reviews. They can click on a review to see the full detail. The number of registered users who found the review helpful or unhelpful is also displayed.

Register: Visitors must register to post a review. During registration, users need to provide their username, password, an avatar, and a short description (optional).

Login: After successful registration, users can log in to start posting reviews. The option to be "remembered" by the website is available, which extends the "remember" period by 3 weeks for each subsequent visit.

Logout: Users can log out from their account, cutting short the "remember" period (if it exists) and clearing any session-related data.

View User Profile: Each user has a public profile page displaying their username, profile picture, and a short description. A portion of the user's latest reviews and comments is visible, with an option to view the rest of their posts and comments.

Edit Profile: Logged-in users can edit their profile, update their profile picture, and modify the short description.

Create a Review: Logged-in users can create reviews for selected establishments. They need to provide a title, review body, and a rating. The rating system can be customized (e.g., 5-star rating, recommended/not recommended). Users can also attach media (e.g., images, videos) to their review. Markup (e.g., rich text editing) can be optionally allowed without risking cross-site scripting.

Mark as Helpful/Unhelpful: Logged-in users can mark a review as helpful or unhelpful once.

Edit/Delete a Review: Review owners can edit their reviews at any time. Edited reviews will have an indication of being edited. Review owners also have the option to delete their reviews.

Search Establishments/Reviews: Visitors and users can search for establishments based on similarities in the name or description. They can also filter establishments based on their overall rating. Additionally, they can search for reviews based on similarities in the title or post body.

Establishment Owner Response: An additional user account role called "establishment owner" allows owners to respond to reviews about their establishment. Their responses will be published and visible to the public.

Installation:
Instructions on how to install and set up the DLSU Food Review web application will be provided here. Include any required dependencies and how to run the application locally.

1. Open the project folder and the app.js file.
2. In the terminal, type the command "node app.js" to run the application.
3. To access the application locally, open your web browser and enter the following URL: "http://localhost:3000/main".
   This will automatically display the main page for unregistered users. On this page, you can view reviews, replies, and user profiles. However, liking, disliking, and commenting on posts and replies are not available to unregistered users.
4. To be able to do the aforementioned functionalities, one may register/login in by clicking the login button in the 
   profile icon found in the upper right of the sticky header.
5. When you click on the logo situated in the leftmost part of the header, it will redirect you to the main page.