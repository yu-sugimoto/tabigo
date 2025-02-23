import MapView, { Polygon } from "react-native-maps";

const TravelerMap = () => {
  const polygonCoords = [
    { latitude: 35.681236, longitude: 139.767125 },
    { latitude: 35.685236, longitude: 139.767125 },
    { latitude: 35.685236, longitude: 139.771125 },
    { latitude: 35.681236, longitude: 139.771125 },
  ];

  return (
    <MapView
      style={{ width: "100%", height: "100%" }}
      initialRegion={{
        latitude: 35.681236,
        longitude: 139.767125,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Polygon coordinates={polygonCoords} fillColor="rgba(0,0,255,0.2)" />
    </MapView>
  );
}

export default TravelerMap;