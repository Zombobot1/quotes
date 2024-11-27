package main

import (
	"log"
	"os"

	_ "invoicing-api/migrations"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	// Load env vars
	godotenv.Load()

	// New Pocketbase App
	app := pocketbase.New()
	// Enable migration engine
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{})

	// serves static files from the provided public dir (if exists)
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS("./pb_public"), false))
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
