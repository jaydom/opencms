#!/usr/bin/env python
# -*- coding: utf-8 -*-
#coding=utf-8
' a http parse test programe '

__author__ = 'jaydomchen'

from PIL  import Image,ImageDraw,ImageFont  
import hashlib
import sys

def md5sum(filename):             
    fd = open(filename,"r")  
    fcont = fd.r  
    fd.close()           
    fmd5 = hashlib.md5(fcont)  
    return fmd5

def build_image(argv):
    for i in range(1,len(argv)):
        argv[i] = argv[i].decode('gbk').encode('utf-8')
    ttfont = ImageFont.truetype(u"./image_builder/华文细黑.ttf",20)  #这里我之前使用Arial.ttf时不能打出中文，用华文细黑就可以
    #ttfont2 = ImageFont.truetype(u"./image_builder/华文行楷.ttf",40)  #这里我之前使用Arial.ttf时不能打出中文，用华文细黑就可以
    ttfont3 = ImageFont.truetype(u"./image_builder/华文行楷.ttf",90)  #这里我之前使用Arial.ttf时不能打出中文，用华文细黑就可以
    img = Image.open("./image_builder/bmg.jpg")
    draw = ImageDraw.Draw(img)
    draw.text((380,766),unicode(argv[1], "utf-8"), fill=(0,0,0),font=ttfont) #等级
    draw.text((640,766),unicode(argv[2], "utf-8"), fill=(0,0,0),font=ttfont) #性别
    draw.text((890,766),unicode(argv[3], "utf-8"), fill=(0,0,0),font=ttfont) #考场
    draw.text((380,812),unicode(argv[4], "utf-8"), fill=(0,0,0),font=ttfont) #证书编号
    draw.text((640,812),unicode(argv[5], "utf-8"), fill=(0,0,0),font=ttfont) #证书号码
    draw.text((890,812),unicode(argv[6], "utf-8"), fill=(0,0,0),font=ttfont) #考证日期
    draw.text((380,858),unicode(argv[7], "utf-8"), fill=(0,0,0),font=ttfont) #颁证日期
    #draw.text((1040,840),unicode(argv[8], "utf-8"), fill=(0,0,0),font=ttfont2) #签名
    point = 755 - (len(unicode(argv[8], "utf-8"))*90/2 )
    draw.text((point,400),unicode(argv[8], "utf-8"), fill=(0,0,0),font=ttfont3) #签名
    img.save('./public/certs/'+argv[4]+'.jpg')


if __name__ == "__main__":
    build_image(sys.argv)
    #fmd5 = md5sum(sys.argv[1])
    #print fmd5.hexdigest()