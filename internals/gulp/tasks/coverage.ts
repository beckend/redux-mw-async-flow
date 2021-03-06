import { cmdSpawn } from 'cmd-spawn';
import * as debugMod from 'debug';
import * as gulp from 'gulp';
import {
  PATH_PACKAGE,
} from '../config';

gulp.task('coverage', async () => {
  const pkg = require(PATH_PACKAGE);
  const cmd = pkg.scripts['test:coverage'];
  const debug = debugMod('task-coverage');
  debug(`running: ${cmd}`);
  const r = await cmdSpawn(cmd, { buffer: true });
  if (r) {
    // tslint:disable-next-line: no-console
    console.log(r.stdout);
  }
  debug(`finish: ${cmd}`);
});
