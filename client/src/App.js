import React, { useState, useEffect } from "react";
import GoogleMapReact from "google-map-react";
import mcdonaldsUnavailable from "./images/mcdonalds-unavail.png";
import mcdonalds from "./images/mcdonalds.png";
import { withStyles, Popover } from "@material-ui/core";
import PropTypes from "prop-types";
import axios from "axios";

const styles = {
  paper: {
    padding: "20px",
    width: "19vw",
  },
  popover: {
    pointerEvents: "none",
  },
};

const Marker = ({
  className,
  classes,
  key,
  lat,
  lng,
  text,
  logo,
  menu,
  openedPopoverId,
  handlePopoverOpen,
  handlePopoverClose,
  anchorEl,
}) => (
  <div key={key} lat={lat} lng={lng}>
    <Popover
      className={className}
      classes={classes}
      open={openedPopoverId === text}
      onClose={handlePopoverClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <h2>{text}</h2>
      {menu.map((mcflurry) => (
        <p>{mcflurry.name}</p>
      ))}
    </Popover>
    <img alt={logo} src={logo} onClick={handlePopoverOpen} />
  </div>
);

function App(props) {
  const [isFetching, setFetching] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [openedPopoverId, setOpenPopoverId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/getData", {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => {
        setRestaurants(res.data);
        setFetching(true);
      })
      .catch((err) => console.log(err));
  }, []);

  const handlePopoverOpen = (event, name) => {
    setOpenPopoverId(name);
    setAnchorEl(event.target);
  };

  const handlePopoverClose = () => {
    setOpenPopoverId(null);
    setAnchorEl(null);
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{
          key: TOKEN,
        }}
        defaultCenter={{ lat: 45.54, lng: -73.7 }}
        defaultZoom={12}
        isMarkerShown={isFetching}
      >
        {restaurants.map((restaurant, index) => (
          <Marker
            className={props.classes.popover}
            classes={{
              paper: props.classes.paper,
            }}
            key={index}
            lat={restaurant.location.latitude}
            lng={restaurant.location.longitude}
            text={restaurant.name}
            logo={restaurant.menu ? mcdonalds : mcdonaldsUnavailable}
            menu={restaurant.menu ? restaurant.menu : [{ name: "No McFlurry" }]}
            openedPopoverId={openedPopoverId}
            handlePopoverOpen={(e) => handlePopoverOpen(e, restaurant.name)}
            handlePopoverClose={handlePopoverClose}
            anchorEl={anchorEl}
          />
        ))}
      </GoogleMapReact>
    </div>
  );
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
