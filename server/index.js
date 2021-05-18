const express = require("express");
const cors = require("cors");
var axios = require("axios");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.get("/api/getData", async (req, res) => {
  try {
    var configCustomer = {
      method: "post",
      url: "https://api.skipthedishes.com/customer/v1/graphql",
      headers: {
        pragma: "no-cache",
        "cache-control": "no-cache",
        parameters: "isCuisineSearch=false&isSorted=false&search=mc",
        "app-token": "d7033722-4d2e-4263-9d67-d83854deb0fc",
        "content-type": "application/json",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36",
      },
      data: {
        operationName: "QueryRestaurantsCuisinesList",
        variables: {
          city: "montreal",
          province: "QC",
          dateTime: 0,
          isDelivery: true,
          search: "mcdonalds",
          sortBy: { index: -1, value: null },
          language: "en",
          address: {},
        },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash:
              "7b26cd706d2cb6f061afbb257debd2d8172472a5a3f94059379c78767dde5954",
          },
        },
      },
    };
    axios(configCustomer).then(async function (response) {
      try {
        let data = JSON.stringify(response.data);
        let parsedData = JSON.parse(data);
        let openRestaurants = parsedData.data.restaurantsList.openRestaurants;
        const json = await Promise.all(
          openRestaurants.map(async (restaurant) => {
            const menu = await getMenu(restaurant);
            const promises = {
              name: restaurant.location.name,
              url: restaurant.cleanUrl,
              location: {
                latitude: restaurant.location.position.latitude,
                longitude: restaurant.location.position.longitude,
              },
              menu: menu,
            };
            return promises;
          })
        );
        res.send(json);
      } catch (err) {
        res.send(err);
      }
    });
  } catch (err) {
    res.send(err);
  }
});

async function getMenu(restaurant) {
  let configRestaurants = {
    method: "get",
    url:
      "https://api-skipthedishes.skipthedishes.com/v1/restaurants/clean-url/" +
      restaurant.cleanUrl +
      "?fullMenu=true&language=en",
    headers: {
      pragma: "no-cache",
      "cache-control": "no-cache",
      "app-token": "d7033722-4d2e-4263-9d67-d83854deb0fc",
      "content-type": "application/json",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36",
    },
  };

  const response = await axios(configRestaurants)
    .then((response) => {
      let mcflurrys = [];

      let menuDessert = response.data.menu.menuGroups.filter(
        (menu) => menu.name === "Desserts"
      );
      if (menuDessert.length !== 0) {
        mcflurrys = menuDessert[0].menuItems.filter((item) =>
          item.name.includes("McFlurry")
        );
      }
      return mcflurrys;
    })
    .catch((err) => console.log(err));

  return response;
}

app.listen(port, () => console.log(`Listening on port ${port}`));
