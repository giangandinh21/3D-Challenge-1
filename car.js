// car.js
export function createCarController({
  THREE, CANNON, world, scene, camera, renderer,
  carBody, carMesh, visualBody, frontWheels, rearWheels,
  config,
  hud: { speedEl, timeEl, gearEl } = {},
  getStartTime = () => Date.now(),
}) {
  const inputs = { w: false, a: false, s: false, d: false };
  let currentSteer = 0;
  let currentGear = "N";
  let startTime = getStartTime();
  const hasHud = !!(speedEl && timeEl && gearEl);

  function setupInputs() {
    const handleKey = (key, state) => {
      switch (key) {
        case "w": inputs.w = state; break;
        case "s": inputs.s = state; break;
        case "a": inputs.a = state; break;
        case "d": inputs.d = state; break;
        case "r": if (state) reset(); break;
      }
    };
    document.addEventListener("keydown", (e) => handleKey(e.key.toLowerCase(), true));
    document.addEventListener("keyup", (e) => handleKey(e.key.toLowerCase(), false));
  }

  function reset(position = new CANNON.Vec3(0, 3, -40)) {
    carBody.position.copy(position);
    carBody.quaternion.set(0, 0, 0, 1);
    carBody.velocity.set(0, 0, 0);
    carBody.angularVelocity.set(0, 0, 0);
    currentSteer = 0;
    currentGear = "N";
    startTime = getStartTime();
    carBody.wakeUp?.();
  }

  function update() {
    const P = config.physics;

    if (inputs.w || inputs.s || inputs.a || inputs.d) carBody.wakeUp?.();

    // Local velocity
    const localVelocity = new CANNON.Vec3(0, 0, 0);
    carBody.vectorToLocalFrame(carBody.velocity, localVelocity);
    const forwardSpeed = localVelocity.z;

    const speed = carBody.velocity.length();
    const speedKmh = speed * 3.6;

    // Engine / Brake
    let appliedForce = 0;
    if (inputs.w) { appliedForce = P.force; currentGear = "D"; }
    if (inputs.s) {
      if (forwardSpeed > 1.0) { appliedForce = -P.brake * 14; currentGear = "D"; }
      else { appliedForce = -P.reverseForce; currentGear = "R"; }
    }
    carBody.applyLocalForce(new CANNON.Vec3(0, 0, appliedForce), new CANNON.Vec3(0, 0, 0));

    // Speed-sensitive steering
    let targetS = 0;
    if (inputs.a) targetS = P.maxSteer;
    if (inputs.d) targetS = -P.maxSteer;
    currentSteer = THREE.MathUtils.lerp(currentSteer, targetS, P.steerSpeed);

    const steerScale = THREE.MathUtils.clamp(1.0 - (speedKmh / 160), 0.35, 1.0);
    const dir = forwardSpeed >= 0 ? 1 : -1;
    if (speed > 0.4) carBody.angularVelocity.y = currentSteer * 6.0 * steerScale * dir;
    else carBody.angularVelocity.y *= 0.8;

    // Grip / Traction
    const rightVec = new CANNON.Vec3(1, 0, 0);
    carBody.quaternion.vmult(rightVec, rightVec);
    const sidewaysSpeed = carBody.velocity.dot(rightVec);

    const gripK = THREE.MathUtils.lerp(1200, 2200, THREE.MathUtils.clamp(speed / 25, 0, 1));
    const gripForce = -sidewaysSpeed * P.grip * gripK;

    if (speed > 0.5) {
      carBody.applyLocalForce(new CANNON.Vec3(gripForce, 0, 0), new CANNON.Vec3(0, 0, 0));
    }

    // Downforce
    const down = -P.downforce * (speed * speed);
    carBody.applyForce(new CANNON.Vec3(0, down, 0), carBody.position);

    // Stability
    if (!inputs.a && !inputs.d) carBody.angularVelocity.y *= (1 - P.stability);

    carBody.linearDamping = 0.35;
    carBody.angularDamping = 0.75;

    // Sync
    carMesh.position.copy(carBody.position);
    carMesh.quaternion.copy(carBody.quaternion);

    // Visual suspension
    const targetRoll = -currentSteer * 0.12;
    visualBody.rotation.z = THREE.MathUtils.lerp(visualBody.rotation.z, targetRoll, 0.12);

    let targetPitch = 0;
    if (inputs.w) targetPitch = -0.03;
    if (inputs.s) targetPitch = 0.05;
    visualBody.rotation.x = THREE.MathUtils.lerp(visualBody.rotation.x, targetPitch, 0.12);

    // Wheels
    const localV = new CANNON.Vec3();
    carBody.vectorToLocalFrame(carBody.velocity, localV);
    const spinSpeed = localV.z * 0.15;

    frontWheels.forEach((w) => { w.rotation.x += spinSpeed; w.rotation.y = currentSteer; });
    rearWheels.forEach((w) => { w.rotation.x += spinSpeed; });

    // Camera
    const relOffset = new THREE.Vector3(0, 4.2, -11.5);
    const camPos = relOffset.applyMatrix4(carMesh.matrixWorld);
    camera.position.lerp(camPos, 0.10);

    const lookTarget = carMesh.position.clone();
    lookTarget.y += 1.0;
    camera.lookAt(lookTarget);

    // HUD + Render
    if (hasHud) {
      if (speedKmh < 1) currentGear = "N";
      speedEl.innerText = `${Math.round(speedKmh)} km/h`;
      timeEl.innerText = ((Date.now() - startTime) / 1000).toFixed(2);
      gearEl.innerText = currentGear;
      gearEl.style.color = currentGear === "R" ? "red" : "yellow";
    }

    renderer.render(scene, camera);
  }

  return { setupInputs, reset, update };
}
