import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-orbital',
  templateUrl: './orbital.component.html',
  styleUrls: ['./orbital.component.css']
})
export class OrbitalComponent {
  did:string='';
  title = 'orbital';
  fps:any;
  then:any;
  startTime:any;
  now:any;
  elapsed:any;
  direction_changed:any;

  constructor(
    private route: ActivatedRoute) {
      this.did = this.route.snapshot.paramMap.get('id');
  }



ngAfterViewInit(): void {
    

  var self=this;
    var Orbiter = function(orbiter) {
      var canvas = orbiter,
          context = canvas.getContext('2d'),
          framePath = canvas.getAttribute('data-path'),
          diamondID = self.did, //canvas.getAttribute('attr.data-diamond'),
          frameCount = canvas.getAttribute('data-frames') | 0,
          framePrefix = canvas.getAttribute('data-prefix'),
          frameExtension = canvas.getAttribute('data-extension'),
          rotationConstant = canvas.getAttribute('data-rotation-constant') | 0,
          stock_type = canvas.getAttribute('data-stock-type'),
          frameURL = ":basepath/:diamond_id/:prefix:number.:extension",
          images = [],
          mousedown = false,
          timer,
          imagesLoaded = [],
          startPos = 0,
          currentPos = 0,
          currentFrame = 1,
          currentIndex = 1,
          idle,
          autoloop,
          fpsInterval,
          image_indexes_to_load = [],
          image_load_status = [],
          all_images_loaded = false,
          drag_start_count = 0,
          direction = 'anti-clockwise',
          oscillating_video = canvas.getAttribute('data-oscillating-video'),
          last_offset_x = null,
          pad = function (number, length) {
            var string = '' + number;
            while (string.length < length) {
              string = '0' + string;
            }
    
            return string;
          },
          buildImageURL = function (basepath, diamondID, prefix, number, extension) {
            return frameURL
              .replace(':basepath', basepath)
              .replace(':diamond_id', diamondID)
              .replace(':prefix', prefix)
              .replace(':number', pad(number, 3))
              .replace(':extension', extension);
          },
          displayImage = function(index) {
            if (index == 1) {
              if (oscillating_video == 'yes'){
                direction = (direction == 'anti-clockwise') ? 'clockwise' : 'anti-clockwise';
              }else{
                direction = 'clockwise';
              }
            }
    
            if (direction == 'clockwise'){
              var img = images[Math.floor(index)];
            }else{
              var img = images[images.length - Math.floor(index)];
            }
    
            if(typeof(img) != 'undefined') {
              if (img) {
                canvas.height = 600;
                canvas.width = 600;
                context.drawImage(img, 0, 0, 600, 600);
              }
            }
          },
          loadImage = function(index) {
            if(typeof(index) == "undefined"){
              return;
            }
            var imageURL = buildImageURL(framePath, diamondID, framePrefix, index, frameExtension);
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', function() {
              if (xhr.status == 200) {
                cacheImage(index, xhr.response);
              }
    
              var position = next_image_to_load();
              if (position != -1) {
                loadImage(image_indexes_to_load[position]);
              }else{
                all_images_loaded = true;
              }
    
              var position2 = next_image_to_load();
              if (position2 != -1) {
                loadImage(image_indexes_to_load[position2]);
              }
    
            });
            xhr.open('GET', imageURL);
            xhr.responseType = 'arraybuffer';
            xhr.send();
          },
          cacheImage = function(index, response) {
            var blob = new Blob([new Uint8Array(response)]);
            var img = new Image();
            var imageURL = URL.createObjectURL(blob);
            img.src = imageURL;
            images[index] = img;
            if (index == 1) {
              img.onload = function () {
                displayImage(index);
              }
              play();
            }
          },
          play = function() {
            self.fps = frameCount / (2 * Math.PI);
            fpsInterval = rotationConstant / self.fps;
            self.then = Date.now();
            self.startTime = self.then;
            autoRotate();
          },
          autoRotate = function() {
            autoloop = window.requestAnimationFrame(autoRotate);
    
            self.now =  Date.now();
            self.elapsed = self.now - self.then;
    
            if (self.elapsed > fpsInterval) {
              self.then = self.now - (self.elapsed % fpsInterval);
              currentFrame = wrap(currentIndex++, 1, frameCount);
              displayImage(currentFrame);
    
              //for oscillating video stop auto loop if dragged once
              if (oscillating_video == 'yes' && all_images_loaded == true && drag_start_count > 0 && currentFrame == frameCount){
                pause();
              }
    
            }
          },
          pause = function() {
            window.cancelAnimationFrame(autoloop);
          },
          wrap = function (value, min, max){
            while (value > max){ value -= max; }
            while (value < min){ value += max; }
            return value;
          },
          onMouseDown = function(e) {
            e.preventDefault();
            if (e.target == canvas) {
              mousedown = true;
              pause();
              clearTimeout(idle);
              setOffsetValues(e);
            }
          },
          setOffsetValues = function(e) {
            if (e.type === 'touchstart') {
              var rect = e.target.getBoundingClientRect();
              startPos = e.touches[0].pageX - rect.left;
              last_offset_x = e.touches[0].pageX;
            } else {
              startPos = e.offsetX;
              last_offset_x = e.offsetX;
            }
          },
          onMouseUp = function(e) {
            mousedown = false;
            currentIndex = currentFrame;
            idle = setTimeout(play, 3000);
          },
          onDrag = function(e) {
            if (mousedown) {
              drag_start_count = drag_start_count + 1;
              var offset;
              if (e.type === 'touchmove') {
                offset = e.touches[0].clientX;
              } else {
                offset = e.offsetX;
              }
    
              var currentPos = (0 - (offset - startPos));
    
              if (oscillating_video == 'yes'){
                self.direction_changed = false;
                // if offset is changing and going different way then change direction
                if (last_offset_x != offset){
                  if (last_offset_x > offset){
                    if (direction == 'anti-clockwise'){
                      direction = 'clockwise';
                      self.direction_changed = true;
                    }
                  }else{
                    if (direction == 'clockwise'){
                      direction = 'anti-clockwise';
                      self.direction_changed = true;
                    }
                  }
                }
    
                last_offset_x = offset;
    
                if (self.direction_changed == true){
                  //if direction is changed and reached the start or end of list then
                  //change direction and reset the currentFrame
                  if (currentFrame == images.length){
                    direction = (direction == 'anti-clockwise') ? 'clockwise' : 'anti-clockwise';
                    if (direction == 'clockwise'){
                      currentFrame = 1;
                    }else{
                      currentFrame = images.length;
                    }
                  }
    
                  //as per direction set the next frame
                  if (direction == 'clockwise'){
                    currentFrame = (images.length - currentFrame);
                  }else{
                    currentFrame =  (images.length - currentFrame) + 1;
                  }
    
                  currentIndex = currentFrame;
                }else{
                  //if direction not changed then show the next frame
                  if (currentFrame < images.length){
                    currentFrame =  currentFrame + 10; //jump 10 frames
                  }
                }
    
              }else{
                currentFrame = wrap(currentIndex + currentPos, 1, frameCount);
              }
    
              displayImage(currentFrame);
            }
          },
          next_image_to_load = function() {
            var position = -1;
            //first load images in gap if n
            for(var k = 0; k < image_load_status.length; k = k + 10) {
              if (image_load_status[k] == 'N') {
                image_load_status[k] = 'Y';
                position = k;
                break;
              }
            }
    
            // reduce gap
            if (position == -1) {
              for(var k = 0; k < image_load_status.length; k = k + 3) {
                if (image_load_status[k] == 'N') {
                  image_load_status[k] = 'Y';
                  position = k;
                  break;
                }
              }
            }
    
            //finally load all pending
            if (position == -1) {
              for(var k = 0; k < image_load_status.length; k++) {
                if (image_load_status[k] == 'N') {
                  image_load_status[k] = 'Y';
                  position = k;
                  break;
                }
              }
            }
    
            return position;
          };
    
      for (var x = 1; x < frameCount + 1; x++) {
        for (var i = 1, dx = frameCount / x | 0; i < frameCount; i += dx) {
          if (!imagesLoaded[i]) {
            imagesLoaded[i] = i + 1;
            //loadImage(i);
            image_load_status[i - 1] = 'N';
            image_indexes_to_load.push(parseInt(i.toString(), 10));
          }
        }
      }
    
      image_indexes_to_load = image_indexes_to_load.sort(function (a, b) {  return a - b;  });
    
      loadImage(image_indexes_to_load[next_image_to_load()]);
    
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('touchstart', onMouseDown);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('touchend', onMouseUp);
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('touchmove', onDrag);
    };
    
    var canvas = document.getElementById('orbiter');
    new Orbiter(canvas);


  }

}

