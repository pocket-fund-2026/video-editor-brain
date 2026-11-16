// Hand-illustrated post pass: ink outlines (normal + depth edges, slightly wobbled), banded cel shading,
// diagonal hatching in the darkest band, and paper grain. Static noise only (no temporal shimmer).
// Objects with userData.noInk = true (steam, glass film, particles) are hidden from the normal pass so they do not get outlined.
window.Ink = {
  create(THREE, renderer, W, H, o) {
    o = Object.assign({ bands: 5, line: 1.5, hatch: 0.22, paper: 0.035, ink: [0.06, 0.11, 0.11] }, o || {});
    const depthTex = new THREE.DepthTexture(W, H); depthTex.type = THREE.UnsignedIntType;
    const rtC = new THREE.WebGLRenderTarget(W, H, { depthTexture: depthTex, samples: 4, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    const rtN = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const nmat = new THREE.MeshNormalMaterial();
    const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const mat = new THREE.ShaderMaterial({
      uniforms: { tC: { value: rtC.texture }, tN: { value: rtN.texture }, tD: { value: depthTex }, px: { value: new THREE.Vector2(1 / W, 1 / H) },
        res: { value: new THREE.Vector2(W, H) }, near: { value: 0.1 }, far: { value: 200 }, bands: { value: o.bands }, line: { value: o.line },
        hatch: { value: o.hatch }, colEdge: { value: 0 }, sat: { value: 1 }, paper: { value: o.paper }, ink: { value: new THREE.Vector3(...o.ink) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
      fragmentShader: `
        uniform sampler2D tC,tN,tD; uniform vec2 px,res; uniform float near,far,bands,line,hatch,paper,colEdge,sat; uniform vec3 ink; varying vec2 vUv;
        float lin(float d){ float z=d*2.-1.; return (2.*near*far)/(far+near-z*(far-near)); }
        float rnd(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
        float nz(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(rnd(i),rnd(i+vec2(1,0)),f.x),mix(rnd(i+vec2(0,1)),rnd(i+vec2(1,1)),f.x),f.y); }
        void main(){
          vec2 wob=(vec2(nz(vUv*vec2(70.,125.)),nz(vUv*vec2(70.,125.)+17.3))-.5)*px*3.0;
          vec2 uv=vUv+wob; vec2 d=px*line;
          vec3 col=texture2D(tC,uv).rgb;
          gl_FragColor=vec4(col,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          vec3 c=gl_FragColor.rgb; { float gy=dot(c,vec3(.299,.587,.114)); c=mix(vec3(gy),c,sat); }
          float l=dot(c,vec3(.299,.587,.114)); float q=floor(l*bands+.5)/bands;
          c=mix(c,c*clamp((q+.05)/(l+.05),.55,1.5),.8);
          vec3 nR=texture2D(tN,uv+vec2(d.x,0.)).rgb,nL=texture2D(tN,uv-vec2(d.x,0.)).rgb,nU=texture2D(tN,uv+vec2(0.,d.y)).rgb,nD=texture2D(tN,uv-vec2(0.,d.y)).rgb;
          float en=length(nR-nL)+length(nU-nD);
          float zC=lin(texture2D(tD,uv).r),zR=lin(texture2D(tD,uv+vec2(d.x,0.)).r),zL=lin(texture2D(tD,uv-vec2(d.x,0.)).r),zU=lin(texture2D(tD,uv+vec2(0.,d.y)).r),zD=lin(texture2D(tD,uv-vec2(0.,d.y)).r);
          float ed=(abs(zR-zL)+abs(zU-zD))/max(zC,.001);
          float edge=max(smoothstep(.35,.8,en),smoothstep(.02,.06,ed));
          { vec3 cR=texture2D(tC,uv+vec2(d.x*1.2,0.)).rgb,cL=texture2D(tC,uv-vec2(d.x*1.2,0.)).rgb,cU=texture2D(tC,uv+vec2(0.,d.y*1.2)).rgb,cD=texture2D(tC,uv-vec2(0.,d.y*1.2)).rgb;
            float g=length(cR-cL)+length(cU-cD); edge=max(edge,smoothstep(.5,1.1,g)*colEdge); }
          edge*=.75+.5*nz(uv*vec2(40.,70.)*3.);
          float hat=step(.5,fract((uv.x*res.x+uv.y*res.y)/7.))*step(l,.30)*hatch;
          c*=1.-hat;
          c=mix(c,ink*.8+.03,clamp(edge,0.,1.));
          c+=(nz(uv*res*.45)-.5)*paper;
          gl_FragColor=vec4(c,1.);
        }`,
      depthTest: false, depthWrite: false });
    quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    return { set(p) { for (const k in p) mat.uniforms[k].value = p[k]; }, render(scene, cam) {
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
