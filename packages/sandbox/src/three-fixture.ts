import type { ExplorableModule } from "@explorables/explorable";
import {
  BoxGeometry,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

const fixture: ExplorableModule = {
  mount(root) {
    const canvas = document.createElement("canvas");
    const renderer = new WebGLRenderer({ canvas, antialias: true });
    const scene = new Scene();
    const camera = new PerspectiveCamera(45, 1, 0.1, 100);
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0x365b4b });
    const blocks = new InstancedMesh(geometry, material, 4);
    const matrix = new Matrix4();
    for (let index = 0; index < 4; index += 1) {
      blocks.setMatrixAt(index, matrix.makeTranslation(index * 1.25, 0, 0));
    }
    scene.add(blocks);
    camera.position.set(2, 2, 8);
    renderer.render(scene, camera);
    root.append(canvas);

    return {
      destroy() {
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        root.replaceChildren();
      },
    };
  },
};

export default fixture;
