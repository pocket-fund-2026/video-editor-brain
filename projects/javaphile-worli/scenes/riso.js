// Risograph post pass (two inks on paper). Plate A = cobalt blue (shadows, edges), plate B = chartreuse (colourful and mid-light areas).
// Each plate is a halftone screen at its own angle; plate B is sampled with a misregistration offset `mis` (px) that the film clock
// kicks on every landing and settles back to a small residual. Overprint is multiplicative, so where both inks meet it turns dark green-blue.
// Static paper grain only (no temporal shimmer). Objects with userData.noInk are hidden from the normal pass.
window.Riso = {
  create(THREE, renderer, W, H) {
    const depthTex = new THREE.DepthTexture(W, H); depthTex.type = THREE.UnsignedIntType;
    const rtC = new THREE.WebGLRenderTarget(W, H, { depthTexture: depthTex, samples: 4, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    const rtN = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const nmat = new THREE.MeshNormalMaterial();
    const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const mat = new THREE.ShaderMaterial({
      uniforms: { tC: { value: rtC.texture }, tN: { value: rtN.texture }, tD: { value: depthTex }, px: { value: new THREE.Vector2(1 / W, 1 / H) },
        res: { value: new THREE.Vector2(W, H) }, near: { value: 0.1 }, far: { value: 200 }, mis: { value: new THREE.Vector2(3, 2) },
        dens: { value: 1.3 }, ychar: { value: 1.0 }, line: { value: 1.4 }, paperCol: { value: new THREE.Vector3(0.905, 0.915, 0.89) },
        inkA: { value: new THREE.Vector3(0.10, 0.22, 0.86) }, inkB: { value: new THREE.Vector3(0.80, 0.90, 0.02) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
      fragmentShader: `
        uniform sampler2D tC,tN,tD; uniform vec2 px,res,mis; uniform float near,far,dens,ychar,line; uniform vec3 paperCol,inkA,inkB; varying vec2 vUv;
        float lin(float d){ float z=d*2.-1.; return (2.*near*far)/(far+near-z*(far-near)); }
        float rnd(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
        float nz(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(rnd(i),rnd(i+vec2(1,0)),f.x),mix(rnd(i+vec2(0,1)),rnd(i+vec2(1,1)),f.x),f.y); }
        vec3 srgb(vec3 c){ vec4 o=vec4(c,1.); gl_FragColor=o; return c; }
        vec3 scene(vec2 uv){
          vec3 c=texture2D(tC,uv).rgb;
          gl_FragColor=vec4(c,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          return gl_FragColor.rgb;
        }
        float screen(vec2 p,float ang,float cell,float d){
          float ca=cos(ang),sa=sin(ang); vec2 q=vec2(ca*p.x+sa*p.y,-sa*p.x+ca*p.y)*6.2831853/cell;
          float v=(cos(q.x)+cos(q.y))*.25+.5; return smoothstep(v-.07,v+.07,d);
        }
        void main(){
          vec2 pp=vUv*res; vec2 d=px*line;
          vec3 cA=scene(vUv);
          vec3 cB=scene(clamp(vUv+mis*px,0.001,0.999));
          float lA=dot(cA,vec3(.299,.587,.114)), lB=dot(cB,vec3(.299,.587,.114));
          float sB=max(cB.r,max(cB.g,cB.b))-min(cB.r,min(cB.g,cB.b));
          // edges from normals + depth + colour step
          vec3 nR=texture2D(tN,vUv+vec2(d.x,0.)).rgb,nL=texture2D(tN,vUv-vec2(d.x,0.)).rgb,nU=texture2D(tN,vUv+vec2(0.,d.y)).rgb,nD=texture2D(tN,vUv-vec2(0.,d.y)).rgb;
          float en=length(nR-nL)+length(nU-nD);
          float zC=lin(texture2D(tD,vUv).r),zR=lin(texture2D(tD,vUv+vec2(d.x,0.)).r),zL=lin(texture2D(tD,vUv-vec2(d.x,0.)).r),zU=lin(texture2D(tD,vUv+vec2(0.,d.y)).r),zD=lin(texture2D(tD,vUv-vec2(0.,d.y)).r);
          float ed=(abs(zR-zL)+abs(zU-zD))/max(zC,.001);
          float edge=max(smoothstep(.45,.9,en),smoothstep(.03,.08,ed));
          float grain=nz(pp*.55)*.5+nz(pp*1.7)*.5;
          // plate A (blue): dark areas and edges. Plate B (chartreuse): colourful areas, plus a light tint over mid-bright areas.
          float dA=clamp(pow(1.-lA,1.15)*1.15*dens,0.,1.);
          float dB=clamp(smoothstep(.07,.38,sB)*(.12+.88*smoothstep(.22,.62,lB))*ychar+smoothstep(.5,.9,lB)*.16*ychar,0.,1.);
          float covA=max(screen(pp,.7854,8.,dA),edge*.95);
          float covB=screen(pp,1.309,10.,dB);
          covA*=.86+.14*grain; covB*=.84+.16*(1.-grain);
          vec3 col=paperCol*(1.-.04*grain);
          col*=mix(vec3(1.),inkA,covA);
          col*=mix(vec3(1.),inkB,covB);
          col+= (rnd(pp)-.5)*.018;
          gl_FragColor=vec4(col,1.);
        }`,
      depthTest: false, depthWrite: false });
    quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    return { set(p) { for (const k in p) { const u = mat.uniforms[k]; if (u.value && u.value.set) u.value.set(...[].concat(p[k])); else u.value = p[k]; } }, render(scene, cam) {
      mat.uniforms.near.value = cam.near; mat.uniforms.far.value = cam.far;
      renderer.setRenderTarget(rtC); renderer.clear(); renderer.render(scene, cam);
      const hid = []; scene.traverse((m) => { if (m.userData && m.userData.noInk && m.visible) { m.visible = false; hid.push(m); } });
      const bg = scene.background, fg = scene.fog; scene.background = new THREE.Color(0x8080ff); scene.fog = null; scene.overrideMaterial = nmat;
      renderer.setRenderTarget(rtN); renderer.clear(); renderer.render(scene, cam);
      scene.overrideMaterial = null; scene.background = bg; scene.fog = fg; hid.forEach((m) => (m.visible = true));
      renderer.setRenderTarget(null); renderer.render(quadScene, quadCam);
    } };
  },
};
