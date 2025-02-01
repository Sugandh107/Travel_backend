// require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const destinationRoutes = require('./routes/destinationRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const chatsRoutes = require('./routes/chatRoutes');
const messagesRoutes = require('./routes/messageRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//bookings
const AMADEUS_API_URL = "https://test.api.amadeus.com/v1";
let accessToken = "";

// Function to get the access token
const getAccessToken = async () => {
  const response = await fetch(`${AMADEUS_API_URL}/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: 'RzO1u2Jpdo6YvkQSkKYcR5bdNulPtflF',
      client_secret: "tV0H2dDKAkQAf1MP",
    }),
  });

  const data = await response.json();
  accessToken = data.access_token;
};

// Middleware to check or refresh token
const checkAccessToken = async (req, res, next) => {
  if (!accessToken) {
    await getAccessToken();
  }
  next();
};

// Flight search route
app.post("/api/flights", checkAccessToken, async (req, res) => {
  try {
    const response = await fetch(`${AMADEUS_API_URL}/shopping/flight-offers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log(data)
    res.json(data);
    
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch flight data" });
  }
});

// Hotel search route
app.get("/api/hotels/:cityCode/:country", checkAccessToken, async (req, res) => {
  const { cityCode, country } = req.params;

  try {
    const response = await fetch(
      `${AMADEUS_API_URL}/reference-data/locations/hotels/by-city?cityCode=${cityCode}&countryCode=${country}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hotel data" });
  }
});

// Routes
app.use('/api/destinations', destinationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/blogs', require('./routes/blogRoutes'));
// app.use(chatsRoutes);
// app.use(messagesRoutes);
app.use('/api/expense',expenseRoutes)

// Connect to MongoDB
mongoose.connect("mongodb+srv://riderghost10791:newPassword@cluster0.4orqspb.mongodb.net/Travel?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
