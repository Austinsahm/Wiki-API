const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
};

app.set('view-engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

main().catch((err) => { console.log(err) });

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wikiDB');

    const articleSchema = new mongoose.Schema({
        title: String,
        content: String,
    });

    const Article = mongoose.model("Article", articleSchema);

    /***************************  REQUESTS TARGETING ALL ARTICLES ***********************/
    app.route("/articles")
        .get((req, res) => {
            Article.find().then((foundArticles) => {
                if (foundArticles) {
                    res.send(foundArticles)
                } else {
                    res.status(403).send("No Articles Found!");
                }
            }).catch((err) => {
                res.send(err)
            })
        })
        .post((req, res) => {

            const newArticle = new Article({
                title: req.body.title,
                content: req.body.content,
            });
            newArticle.save().then((saved) => {
                if (saved) { res.send("Successfully added a new article.") } else {
                    res.send("Error adding the article")
                }
            }).catch((err) => {
                res.send(err)
            });
        })
        .delete((req, res) => {
            Article.deleteMany().then((gone) => {
                if (gone) {
                    res.send("Successfully deleted all articles");
                } else {
                    console.log('No Articles to delete');
                }
            }).catch((err) => {
                res.send(err);
            });
        });


    /***************************  REQUEST TARGETING A SPECIFIC ARTICLE *******************/
    app.route("/articles/:articleTitle")
        .get(
            (req, res) => {
                title = req.params.articleTitle
                Article.findOne({ title }).then(
                    (found) => {
                        if (found) {
                            res.send(found)
                        } else {
                            // res.send("Not found");
                            res.status(404).send("No Articles Found!")
                        }
                    }
                ).catch((err) => { res.send(err) });
            }
        )
        .put(
            (req, res) => {
                title = req.params.articleTitle;
                Article.updateOne({ title }, { title: req.body.title, content: req.body.content })
                    .then((found) => {
                        if (found) {
                            res.send(title + " upadated successfully");
                        }
                    }).catch((err) => { console.log(err) })
            }
        )
        .patch((req, res) => {
            title = req.params.articleTitle
            Article.updateOne({ title }, { $set: req.body }).then((found) => {
                if (found) {
                    res.status(200).send(title + " updated successfully")
                } else {
                    res.status(404).send('Article not found')
                }
            }).catch((err) => {
                res.send(err);
            })
        })
        .delete((req, res) => {
            title = req.params.articleTitle;
            Article.deleteOne({ title: title }).then((found) => {
                if (found) {
                    res.status(200).send(title + " successfully deleted");
                } else {
                    res.status(404).send(title + " not deleted");
                }
            }).catch((err) => {
                res.send(err)
            })
        });

    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    })
}










