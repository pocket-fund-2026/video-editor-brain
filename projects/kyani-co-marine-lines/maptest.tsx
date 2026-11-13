import { AbsoluteFill, Composition, registerRoot } from "raea";
import { Canvas3D, Entity } from "raea/3d";
import { Camera3d } from "raea/camera";
import { Transform } from "raea/transform";
import { Mesh3d, BufferMesh } from "raea/mesh";
import { StandardMaterial } from "raea/pbr";
import { DirectionalLight, AmbientLight } from "raea/light";
import { CITY, JER, ROADS, GREEN, JER_FACTS } from "./src/mapdata";

function Map() {
  const c = JER_FACTS.centre;
  return (
    <AbsoluteFill style={{ background: "#0b0c10" }}>
      <Camera3d transform={Transform.fromXyz(c[0] - 40, 230, c[1] + 330).lookingAt([c[0], 6, c[1]])} projection={{ Perspective: { fov: (38 * Math.PI) / 180 } }} />
      <DirectionalLight transform={Transform.fromXyz(c[0] - 200, 300, c[1] + 120).lookingAt([c[0], 0, c[1]])} illuminance={9000} shadow_maps_enabled />
      <AmbientLight brightness={260} color="#9fb0d8" />
      <Mesh3d name="city"><BufferMesh {...CITY} /><StandardMaterial base_color="#ffffff" perceptual_roughness={0.9} /></Mesh3d>
      <Mesh3d name="roads"><BufferMesh {...ROADS} /><StandardMaterial base_color="#ffffff" perceptual_roughness={1} /></Mesh3d>
      <Mesh3d name="green"><BufferMesh {...GREEN} /><StandardMaterial base_color="#ffffff" perceptual_roughness={1} /></Mesh3d>
      <Mesh3d name="jer"><BufferMesh {...JER} /><StandardMaterial base_color="#ffffff" perceptual_roughness={0.6} /></Mesh3d>
    </AbsoluteFill>
  );
}
registerRoot(() => <Composition id="map" component={Map} width={1080} height={1920} fps={30} durationInFrames={30} />);
