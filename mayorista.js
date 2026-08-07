
var mayVariants=[], mayColores=[], mayTalles=[], mayColorSelUno=null, mayTalleSelUno=null;
var maySectionHTML = null;

function mayOcultarFormOriginal(){
  var hideEls=document.querySelectorAll('.js-product-form,.product-form,.js-buy-button,.btn-add-to-cart,[data-store*="buy"],.product-variants-container,.js-variant-selector-container');
  hideEls.forEach(function(el){ if(el.style.display!=='none') el.style.display='none'; });
}

function mayAsegurarSeccion(){
  mayOcultarFormOriginal();
  var sec = document.getElementById('mayorista-section');
  if(sec){
    if(sec.style.display!=='block') sec.style.display='block';
    return;
  }
  // Si el bloque desapareció del DOM (otro script lo pisó), lo reinsertamos
  if(!maySectionHTML) return;
  var anchor = document.querySelector('.js-sticky-product') || document.getElementById('single-product');
  if(!anchor) return;
  var wrap = document.createElement('div');
  wrap.innerHTML = maySectionHTML;
  anchor.appendChild(wrap.firstElementChild);
  mayInicializar();
}

window.addEventListener('load', function(){
  var original = document.getElementById('mayorista-section');
  if(original) maySectionHTML = original.outerHTML;
  mayAsegurarSeccion();
  mayInicializar();

  // Reintentar por un rato por si algo re-renderiza la página después de cargar
  var intentos = 0;
  var vigilancia = setInterval(function(){
    mayAsegurarSeccion();
    intentos++;
    if(intentos > 20) clearInterval(vigilancia); // deja de intentar despues de ~10s
  }, 500);

  // Vigilancia permanente y liviana por si tarda mas de eso
  var mo = new MutationObserver(function(){ mayAsegurarSeccion(); });
  mo.observe(document.body, {childList:true, subtree:true});
});

function mayTab(btn,tab){
  document.querySelectorAll('.may-tab').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('.may-panel').forEach(function(p){p.classList.remove('active');});
  btn.classList.add('active');
  document.getElementById('may-panel-'+tab).classList.add('active');
}

function mayGetColorHex(n){
  var m={'negro':'#1a1a1a','black':'#1a1a1a','blanco':'#f0ede8','white':'#f0ede8','crudo':'#e8dfc8','chocolate':'#5c3317','marron':'#6b3a2a','verde':'#3a5a40','rojo':'#c0392b','azul':'#2c4a7c','gris':'#888','grey':'#888','gray':'#888','beige':'#d4b896','nude':'#d4b896','rosa':'#e8a0a0','pink':'#e8a0a0','bordo':'#6b1a2a','naranja':'#e67e22','amarillo':'#f1c40f','lila':'#9b59b6','camel':'#c19a6b','celeste':'#87ceeb','cherry':'#800020','greige':'#c4b5a0','off white':'#f0ede8'};
  return m[n.toLowerCase().trim()]||'#ccc';
}

function mayInicializar(){
  var el=document.getElementById('single-product');
  try{mayVariants=JSON.parse(el.getAttribute('data-variants')||'[]');}catch(e){mayVariants=[];}
  var colSet={},talSet={};
  mayVariants.forEach(function(v){
    if(v.option0&&v.option1){colSet[v.option0]=true;talSet[v.option1]=true;}
    else if(v.option0){talSet[v.option0]=true;}
  });
  mayColores=Object.keys(colSet); mayTalles=Object.keys(talSet);
  mayArmarTabla(); mayArmarUno();
}

function mayGetVariant(color,talle){
  return mayVariants.find(function(v){
    if(color) return v.option0===color&&v.option1===talle;
    return v.option0===talle;
  });
}

function mayArmarTabla(){
  var head=document.getElementById('may-tabla-head'),body=document.getElementById('may-tabla-body');
  var h='<tr><th style="text-align:left">Color / Size</th>';
  mayTalles.forEach(function(t){h+='<th>'+t+'</th>';});
  h+='</tr>'; head.innerHTML=h;
  var b='';
  mayColores.forEach(function(color){
    var hex=mayGetColorHex(color);
    b+='<tr><td><div class="may-color-cell"><span class="may-color-dot" style="background:'+hex+'"></span>'+color+'</div></td>';
    mayTalles.forEach(function(talle){
      var v=mayGetVariant(color,talle);
      if(!v){ b+='<td style="text-align:center"><span class="may-no-stock">⊘</span></td>'; return; }
      var lowStock = v.stock===0;
      b+='<td style="text-align:center"><input type="number" class="may-qty" min="0" value="0" data-variant-id="'+v.id+'" onchange="mayActualizarTotal()">'+(lowStock?'<div style="font-size:9px;color:#c0392b;margin-top:2px;">sin stock</div>':'')+'</td>';
    });
    b+='</tr>';
  });
  body.innerHTML=b;
  document.getElementById('may-total-row').style.display='flex';
}

function mayArmarUno(){
  var colWrap=document.getElementById('may-colors-uno'),sizeWrap=document.getElementById('may-sizes-uno');
  var h='';
  mayColores.forEach(function(color,i){
    var hex=mayGetColorHex(color),sel=i===0?'selected':'';
    h+='<button class="may-color-btn '+sel+'" style="background:'+hex+';border-color:'+(i===0?'#1a1a1a':'transparent')+'" title="'+color+'" onclick="maySelColor(this,\''+color+'\')"></button>';
  });
  colWrap.innerHTML=h; mayColorSelUno=mayColores[0]||null;
  mayActualizarTallesUno();
}

function maySelColor(btn,color){
  document.querySelectorAll('.may-color-btn').forEach(function(b){b.classList.remove('selected');b.style.borderColor='transparent';});
  btn.classList.add('selected'); btn.style.borderColor='#1a1a1a';
  mayColorSelUno=color; mayActualizarTallesUno();
}

function mayActualizarTallesUno(){
  var wrap=document.getElementById('may-sizes-uno'),h='',first=false;
  mayTalles.forEach(function(talle){
    var v=mayGetVariant(mayColorSelUno,talle),exists=!!v;
    var sel=(!first&&exists)?'selected':'';
    if(!first&&exists){mayTalleSelUno=talle;first=true;}
    h+='<button class="may-size-btn '+sel+'" '+(exists?'':'disabled')+' onclick="maySelTalle(this,\''+talle+'\')">'+talle+'</button>';
  });
  wrap.innerHTML=h;
}

function maySelTalle(btn,talle){
  document.querySelectorAll('.may-size-btn').forEach(function(b){b.classList.remove('selected');});
  btn.classList.add('selected'); mayTalleSelUno=talle;
}

function mayActualizarTotal(){
  var t=0; document.querySelectorAll('.may-qty').forEach(function(i){t+=parseInt(i.value)||0;});
  document.getElementById('may-total-unidades').textContent=t;
}

function mayAgregarTabla(){
  var items=[];
  document.querySelectorAll('.may-qty').forEach(function(inp){var q=parseInt(inp.value)||0;if(q>0)items.push({variantId:inp.getAttribute('data-variant-id'),qty:q});});
  if(!items.length){alert('Seleccioná al menos una unidad.');return;}
  var btn=document.getElementById('may-btn-tabla');
  btn.disabled=true; btn.textContent='Agregando...';
  var idx=0;
  function agregarSiguiente(){
    if(idx>=items.length){
      btn.disabled=false; btn.textContent='Agregar al carrito';
      document.querySelectorAll('.may-qty').forEach(function(i){i.value=0;});
      mayActualizarTotal(); return;
    }
    var item=items[idx++];
    maySubmitVariant(item.variantId,item.qty,function(){ setTimeout(agregarSiguiente,800); });
  }
  agregarSiguiente();
}

function mayAgregarUno(){
  if(!mayColorSelUno||!mayTalleSelUno){alert('Seleccioná color y talle.');return;}
  var v=mayGetVariant(mayColorSelUno,mayTalleSelUno);
  if(!v){alert('Combinación no disponible.');return;}
  maySubmitVariant(v.id,parseInt(document.getElementById('may-qty-uno').value)||1,null);
}

function maySubmitVariant(variantId,qty,callback){
  var selects=document.querySelectorAll('.js-variation-option');
  var variant=mayVariants.find(function(v){return v.id==variantId;});
  if(!variant){if(callback)callback();return;}
  selects.forEach(function(sel){
    sel.querySelectorAll('option').forEach(function(opt){
      if(opt.value===variant.option0||opt.value===variant.option1){
        sel.value=opt.value; sel.dispatchEvent(new Event('change',{bubbles:true}));
      }
    });
  });
  setTimeout(function(){
    var normalForm=document.getElementById('normal-product-form');
    var qtyInput=document.querySelector('.js-product-quantity-input,input[name="quantity"]');
    if(qtyInput){qtyInput.value=qty;qtyInput.dispatchEvent(new Event('change',{bubbles:true}));}
    var addBtn=document.querySelector('.js-addtocart,.btn-add-to-cart,[data-store="product-buy-button"] button');
    if(addBtn){
      addBtn.click();
      setTimeout(function(){if(callback)callback();},500);
    } else {if(callback)callback();}
  },300);
}
