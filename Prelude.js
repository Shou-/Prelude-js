/*
Copyright Shou, 2013.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This is based on the Haskell base library with the same name, Prelude. It aims
to bring the convenience of functional programming to Javascript mostly through
higher-order functions (function composition, currying, maps, filters, folds).
*/

// TODO:
// - Finish all utils.
// - Finish Tuple and Show data.
// - Document all of it.

// XXX:
// - Should Nothing be `null' or new Nothing();?
// - Good way to implement tuples.
// - Replace for loops with recursion?

// {{{ Data

// {{{ Maybe

// Nothing :: Maybe a
var Nothing = null

// Just :: a -> Maybe a
function Just(x){
    this.Just = x
}

// isJust :: Maybe a -> Bool
function isJust(m){
    if ("Just" in m) return true
    else return false
}

// fromJust :: Maybe a -> a
function fromJust(m){
    if (isJust(m)) return m.Just
    else error("Maybe.fromJust: Nothing")
}

// maybe :: b -> (a -> b) -> Maybe a -> b
function maybe(b, f, m){
    if (isJust(m)) return f(fromJust(m))
    else return b
}

// }}}

// {{{ Either

// Left :: a -> Either a b
function Left(x){
    this.Left = x;
}

// Right :: b -> Either a b
function Right(x){
    this.Right = x;
}

// isLeft :: Either a b -> Bool
function isLeft(e){
    if ("Left" in e) return true;
    else return false;
}

// isRight :: Either a b -> Bool
function isRight(e){
    if ("Right" in e) return true;
    else return false;
}

// fromLeft :: Either a b -> a
function fromLeft(e){
    if (isLeft(e)) return e.Left;
    else if (isRight(e)) error("Either.fromLeft: Right");
    else error("Not of the data type `Either'");
}

// fromRight :: Either a b -> b
function fromRight(e){
    if (isRight(e)) return e.Right;
    else if (isLeft(e)) error("Either.fromRight: Left");
    else error("Not of the data type `Either'");
}

// either :: (a -> c) -> (b -> c) -> Either a b -> c
function either(f, g, e){
    if (isRight(e)) return g(fromRight(e));
    else if (isLeft(e)) return f(fromLeft(e));
    else error("Not of the data type `Either'");
}

// }}}

// {{{ Tuple

// TODO

function Tuple(){
    for (var i = 0; i < arguments.length; i++) this[i] = arguments[i];
}

// }}}

// {{{ Eq

// eq :: a -> a -> Bool
function eq(x, y){ return x === y }

// max :: Number -> Number -> Number
function max(n, m){
    return Math.max(n, m);
}

// min :: Number -> Number -> Number
function min(n, m){
    return Math.min(n, m);
}

// }}}

// {{{ Show

// show :: a -> String
function show(x){
    return JSON.stringify(x);
}

// }}}

// {{{ Read

// read :: String -> a
function read(x){
    return JSON.parse(x);
}

// maybeRead :: String -> Maybe a
function maybeRead(x){
    try {
        return read(x);
    } catch(e) {
        return Nothing;
    }
}

// }}}

// }}}

// {{{ Miscellaneous functions

// | Identity function.
// id :: a -> a
function id(x){ return x }

// XXX: Despite its type, this function can take an unlimited amount of
// arguments. This is to make it easier to compose functions in Javascript.
// | Function composition.
// co :: (b -> c) -> (a -> b) -> (a -> c)
function co(){
    return foldr1(function(f, g){
        return function(x){ return f(g(x)) }
    }, arguments)
}

// | Function currying.
// cu :: (a -> b -> c) -> a -> (b -> c)
function cu(f, x){
    return function(y){ return f(x, y) }
}

// | flip f takes its (first) two arguments in the reverse order of f.
function flip(f){
    return function(b, a){ return f(a, b) }
}

// | until p f yields the result of applying f until p holds.
// until :: (a -> Bool) -> (a -> a) -> a -> a
function until(p, f, a){
    while (!p(a)) a = f(a)
    return a
}

// | error stops execution and displays an error message.
// error :: String -> a
function error(x){
    new Error(x)
}

// }}}

// {{{ List operations

// | map f xs is the list obtained by applying f to each element of xs, i.e.,
// map f [x1, x2, ..., xn] == [f x1, f x2, ..., f xn]
// map f [x1, x2, ...] == [f x1, f x2, ...]

// map :: (a -> b) -> [a] -> [b]
function map(f, xs){
    for (var i = 0; i < xs.length; i++) xs[i] = f(xs[i]);
    return xs;
}

// | filter, applied to a predicate and a list, returns the list of those
// elements that satisfy the predicate; i.e.,
//
//  filter p xs = [ x | x <- xs, p x]

// filter :: (a -> Bool) -> [a] -> [a]
function filter(p, xs){
    var tmp = [];
    for (var i = 0; i < xs.length; i++) if (p(xs[i])) tmp.push(xs[i]);
    return tmp;
}

// head :: [a] -> a
function head(xs){
    return xs[0];
}

// last :: [a] -> a
function last(xs){
    return xs[xs.length - 1];
}

// tail :: [a] -> [a]
function tail(xs){
    var tmp = [];
    for (var i = 1; i < xs.length; i++) tmp.push(xs[i]);
    return tmp;
}

// init :: [a] -> [a]
function init(xs){
    var tmp = [];
    for (var i = 0; i < xs.length - 1; i++) tmp.push(xs[i]);
    return tmp;
}

// listNull :: [a] -> Bool
function listNull(xs){
    return xs.length === 0;
}

// length :: [a] -> Int
function length(xs){
    return xs.length;
}

// index :: [a] -> Int -> a
function index(xs, n){
    return xs[n];
}

// reverse :: [a] -> [a]
function reverse(xs){
    var tmp = [];
    for (var i = xs.length; i > 0; i++) tmp.push(xs[i]);
    return tmp;
}

// {{{ Reducing lists (folds)

// XXX: >implying this is true folding
// foldl :: (a -> b -> a) -> a -> [b] -> a
function foldl(f, z, xs){
    for (var i = 0; i < xs.length; i++) z = f(z, xs[i]);
    return z;
}

// foldl1 :: (a -> b -> a) -> [b] -> a
function foldl1(f, xs){
    if (xs.length > 0) return foldl(f, head(xs), tail(xs));
    else error("foldl1: empty list");
}

// XXX: >implying this is true folding
// foldr :: (a -> b -> b) -> b -> [a] -> b
function foldr(f, z, xs){
    for (var i = 0; i < xs.length; i++) z = f(z, xs[i]);
    return z;
}

function foldr1(f, xs){
    if (xs.length > 0) return foldl(f, head(xs), tail(xs));
    else error("foldr1: empty list");
}

// }}}

// {{{ Special folds

// and :: [Bool] -> Bool
function and(xs){
    return foldr(function(x, y){ return x && y; }, true, xs);
}

// or :: [Bool] -> Bool
function or(xs){
    return foldr(function(x, y){ return x || y; }, false, xs);
}

// any :: (a -> Bool) -> [a] -> Bool
function any(p, xs){
    return or(map(p, xs));
}

// all :: (a -> Bool -> [a] -> Bool
function all(p, xs){
    return and(map(p, xs));
}

// sum :: [Number] -> Number
function sum(xs){
    return foldr(function(x, acc){ return x + acc; }, 0, xs);
}

// product :: [Number] -> Number
function product(xs){
    return foldr(function(x, acc){ return x * acc; }, 1, xs);
}

// XXX: may be wrong

// concat :: [[a]] -> [a]
function concat(xs){
    return foldr(function(x, acc){ return acc.concat(x); }, [], xs);
}

// concatMap :: (a -> [b]) -> [a] -> [b]
function concatMap(f, xs){
    return foldr(function(x, acc){ return acc.concat(f(x)); }, [], xs);
}

// maximum :: [a] -> a
function maximum(xs){
    if (xs.length > 0) return foldr1(max, xs);
    else error("maximum: empty list");
}

// minimum :: [a] -> a
function minimum(xs){
    if (xs.length > 0) return foldr1(min, xs);
    else error("minimum: empty list");
}

// }}}

// {{{ Scans

// TODO

// scanl :: (a -> b -> a) -> a -> [b] -> [a]
function scanl(f, q, ls){
    if (ls.length === 0) return [];
    else return [q].append(scanl(f, f(q, head(ls)), tail(ls)));
}

// scanl1 :: (a -> a -> a) -> [a] -> [a]
function scanl1(f, xs){
    if (ls.length === 0) return []
    else return scanl(f, head(xs), tail(xs))
}

// scanr :: (a -> b -> b) -> b -> [a] -> [b]
function scanr(f, q, ls){
    if (ls.length === 0) return [q]
    else return []
}

// scanr1 :: (a -> a -> a) -> a -> [a]

// }}}

// {{{ Sublists

// TODO

// take :: Int -> [a] -> [a]
function take(n, xs){
    if (xs.length > 0 && n !== 0)
        return [head(xs)].concat(take(n - 1, tail(xs)))
    else return xs
}

// drop :: Int -> [a] -> [a]
function drop(n, xs){
    if (xs.length > 0 && n !== 0)
        return drop(n - 1, tail(xs))
    else return xs
}

// }}}

// {{{ Searching lists

// elem :: a -> [a] -> Bool
function elem(x, xs){
    var b = false
    for (var i = 0; i < xs.length; i++) b = x === xs[i]
    return b
}

// notElem :: a -> [a] -> Bool
function notElem(x, xs){
    return !elem(x, xs)
}

// }}}

// {{{ Zipping and unzipping lists



// }}}

// {{{ Functions on strings

// lines :: String -> [String]
function lines(s){
    return s.split('\n')
}

// words :: String -> [String]
function words(s){
    return xs.split(' ')
}

// unlines :: [String] -> String
function unlines(xs){
    return xs.join('\n')
}

// unwords :: [String] -> String
function unwords(xs){
    return xs.join(' ')
}

// }}}

// }}}

// {{{ Simple I/O operations

// {{{ Output functions

// putStrLn :: String -> IO ()
function putStrLn(s){
    console.log(s)
}

// print :: a -> IO ()
function print(x){
    putStrLn(show(x))
}

// }}}

// {{{ Files

// readFile :: FilePath -> IO String
function readFile(p){
    return localStorage[p];
}

// writeFile :: FilePath -> String -> IO ()
function writeFile(p, s){
    localStorage[p] = s;
}

// appendFile :: FilePath -> String -> IO ()
function appendFile(p, s){
    localStorage[p] = localStorage[p] + s;
}

// }}}

// }}}

// {{{ Debug

// trace :: String -> a -> a
function trace(s, x){
    console.log(s)
    return x
}

// trace :: a -> b -> b
function traceShow(x, y){
    console.log(show(x))
    return y
}

// }}}
