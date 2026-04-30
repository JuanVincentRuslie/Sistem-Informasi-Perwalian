'use strict';
const express = require('express');
const boom = require('@hapi/boom');
const Joi = require('@hapi/joi');
const applicantService = require('../services/applicant.service');
const router = express.Router();
const { asyncMiddleware } = require('../utils');

const multer = require('multer');
const storage = multer.memoryStorage();
const pdf = require('pdf-parse');
const fs = require('fs');
const upload = multer({
  storage
});
const db = require('../db');

const hurufToId = (huruf) => {
  if(huruf === 'A') return 10;
  if(huruf === 'A-') return 9;
  if(huruf === 'B+') return 8;
  if(huruf === 'B') return 7;
  if(huruf === 'B-') return 6;
  if(huruf === 'C+') return 5;
  if(huruf === 'C') return 4;
  if(huruf === 'C-') return 3;
  if(huruf === 'D') return 2;
  if(huruf === 'E') return 1;
  throw boom.badRequest('Invalid score value');
}

const pagerender = (meta) =>
  meta.getTextContent({
    normalizeWhitespace: true,
    disableCombineTextItems: false
  })
    .then( content => {
      let lastY;
      return content.items.reduce( (acc, item) => {
        let ret;
        if (lastY == item.transform[5] || !lastY && item.width != 0)
          ret = '\t' + item.str;
        else if(item.width != 0)
          ret = '\n' + item.str;
        lastY = item.transform[5];
        return acc + ret;
      }, '').trim();
    })


router.post('/upload-transcript', upload.single('transcript'), asyncMiddleware(async (req, res) => {
  return await pdf(req.file.buffer, {
    pagerender,
  })
    .then(async (data) => {
      const raw = data.text.trim();
      const lines = raw.split('\n').map(line => line.trim()).filter(line => line !== '');
      const npm = lines.filter(line => line.indexOf('NPM') !== -1)[0].split('\t')[1];
      const name = lines.filter(line => line.indexOf('NAMA') !== -1)[0].split('\t')[1];
      const email = lines.filter(line => line.indexOf('EMAIL') !== -1)[0].split('\t')[1];
      const startT = lines.indexOf('Semester1');
      const endT = lines.indexOf('Kode Semester:');
      const _trans = lines
        .slice(startT, endT)
        .filter(line => line.trim() !== '')
        .filter(line => line.indexOf('Semester') === -1)
        .map(line => line.split('\t'))
        .map(line => ({
          kode: line[0],
          nilai: line[2]
        }))
        .filter(item => item.nilai)
        .map(item => ({
          ...item,
          nilai: hurufToId(item.nilai)
        }))
      const trans = [];
      const kodeMap = {};
      _trans.forEach( item => {
        if(kodeMap[item.kode]){
          const old = kodeMap[item.kode];
          const com = item;
          console.log(old.kode, old.nilai, com.kode, com.nilai)
          if(parseInt(old.nilai) < parseInt(com.nilai))
            console.log('Hokay');
          if(parseInt(old.nilai) < parseInt(com.nilai))
            kodeMap[item.kode] = com;
        } else {
          kodeMap[item.kode] = item;
        }
      });
      console.log(kodeMap);
      _trans.forEach( item => {
        if(kodeMap[item.kode]){
          trans.push(kodeMap[item.kode]);
          delete kodeMap[item.kode];
        }
      });

      await db.transaction(async trx => {
        let applicant_id = await trx
          .from('applicants')
          .where('npm', npm)
          .select()
          .then(rows => (rows.length === 0)?false:rows[0].id);
        if(applicant_id === false){
          applicant_id = await trx.into('applicants')
            .returning('id')
            .insert({
              npm,
              name,
              email
            })
            .then( ret => ret[0]);
        } else {
          await trx.table('transcripts').where('applicant_id', applicant_id).delete();
        }
        const compTrans = await Promise.all(trans.map( async (mtk) => {
          return await trx.from('courses').where('course_code','like',`%${mtk.kode}%`)
            .then(data => {
              if(data.length < 1)
                throw boom.notFound(`Course ${mtk.kode} doesn't exist`)
              const row = data[0];
              return {
                course_id: row.id,
                score_id: mtk.nilai,
                applicant_id
              };
            })
        }));
        return await trx.into('transcripts')
          .insert(compTrans);
      });

      res.status(201).json({
        message: `Applicant added along with ${trans.length} transcript entries`
      })
    })
}));

module.exports = router;
