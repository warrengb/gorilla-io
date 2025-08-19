import * as THREE from 'three';

export function setupMeshProperties(child: any): void {
  child.castShadow = true;
  child.receiveShadow = true;

  let mesh = child as THREE.Mesh;
  mesh.material;

  if (child.material.map) {
    let mat = new THREE.MeshPhongMaterial();
    mat.shininess = 0;
    mat.name = child.material.name;
    mat.map = child.material.map;
    if (mat.map)
      mat.map.anisotropy = 4;
    mat.aoMap = child.material.aoMap;
    mat.transparent = child.material.transparent;
    //mat.skinning = child.material.skinning;
    // mat.map.encoding = THREE.LinearEncoding;
    child.material = mat;
  }
}
