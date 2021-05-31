import {
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Paper,
  TextField,
  Typography
} from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { useHistory } from "react-router"
import Autocomplete from "@material-ui/lab/Autocomplete"
import useFetch from "../../composables/useFetch"

import InboxIcon from "@material-ui/icons/Inbox"
import { Backspace, FormatListBulleted, Save } from "@material-ui/icons"
import axios from "axios"
import { Delete } from "react-feather"

const useStyles = makeStyles((theme) => ({
  field: {
    marginTop: 10,
    marginBottom: 10,
    marginRight: theme.spacing(1),
    display: "block"
  },
  container_item: {
    padding: 15,
    marginTop: 15
  }
}))

const Create = () => {
  const classes = useStyles()

  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [customerFieldError, setCustomerFieldError] = useState(false)
  const [productFieldError, setProductFieldError] = useState(false)

  const [detailsError, setDetailsError] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [itemsWithPriceToBeUpdated, setItemsWithPriceToBeUpdated] = useState([])
  const [eachProductTotalCost, setEachProductTotalCost] = useState("")
  const [eachSubQuantity, setEachSubQuantity] = useState(1)

  let each_sub_qty = 1

  const { data: customers } = useFetch("/customers")
  const { data: products } = useFetch("/products")

  const handleSetNewItemPrice = (e, product) => {
    console.log(product)

    const newPrice = e.target.value

    const actualProduct = products.find((item) => item.id === product.id)

    const oldPrice = actualProduct.price
    //Find index of specific object using findIndex method.
    const objIndex = selectedProducts.findIndex((obj) => obj.id == product.id)

    //Update object's property.
    selectedProducts[objIndex].sale_price = newPrice
    selectedProducts[objIndex].old_price = oldPrice
  }

  const handleSetNewItemQuantity = (e, product) => {
    const newQuantity = e.target.value

    const actualProduct = products.find((item) => item.id === product.id)

    //Find index of specific object using findIndex method.
    const objIndex = selectedProducts.findIndex((obj) => obj.id == product.id)

    //Update object's property.
    selectedProducts[objIndex].quantity_ordered = newQuantity

    // set each product total cost
    const qty = parseFloat(actualProduct.quantity_ordered)
    each_sub_qty = qty
  }

  useEffect(() => {}, [])

  const handleSelectedProducts = (e, value) => {
    if (value) {
      // find if product already exists
      console.log(selectedProducts)
      const productExists = selectedProducts.find(
        (obj) => obj._id === value._id
      )

      if (productExists && Object.keys(productExists).length > 0) {
        // do nothing
      } else {
        value.quantity_ordered = 1
        setSelectedProducts((existingProducts) => [...existingProducts, value])
        console.log(value)
      }
    }
  }

  const handleRemoveIitemSelected = (product) => {
    const newProducts = selectedProducts.filter(
      (item) => item._id !== product._id
    )
    setSelectedProducts(newProducts)
    // const newProducts = selectedProducts.find()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCustomerFieldError(false)
    setProductFieldError(false)

    if (selectedCustomer && selectedProducts.length > 0) {
      // order
      const order = {
        customer_name: selectedCustomer.name,
        customer_phone: selectedCustomer.phoneNumber,
        customer_address: selectedCustomer.address,
        products: selectedProducts
      }

      // product prices
      const prices = []
      order.products.map((product) => {
        const price =
          parseFloat(product.sale_price) * parseFloat(product.quantity_ordered)
        prices.push(price)
      })

      // total of prices
      const prices_sum = prices.reduce((a, b) => a + b, 0)
      order.total_price = prices_sum

      try {
        await axios.post("/orders", order).then((res) => console.log(res))
      } catch (error) {
        console.log(error)
      }
    } else {
      setCustomerFieldError(true)
      setProductFieldError(true)
    }
  }

  return (
    <Container>
      <Typography variant="h6">Create Order</Typography>
      <form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Autocomplete
          size="small"
          id="combo-box-demo"
          className={classes.field}
          options={customers}
          getOptionSelected={(option, value) => option.id === value.id}
          getOptionLabel={(option) => `${option.name} - ${option.phoneNumber}`}
          onChange={(e, value) => setSelectedCustomer(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select customer"
              inputProps={{
                ...params.inputProps
              }}
              required={true}
              variant="outlined"
              error={customerFieldError}
            />
          )}
        />
        {products && (
          <>
            <Autocomplete
              size="small"
              id="combo-box-products"
              className={classes.field}
              options={products}
              getOptionSelected={(option, value) => option.id === value.id}
              getOptionLabel={(option) =>
                `${option.productName} - ${option.price}`
              }
              onChange={(e, value) => handleSelectedProducts(e, value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select product"
                  required
                  variant="outlined"
                  error={productFieldError}
                />
              )}
            />
            {selectedProducts.map((product) => (
              <Grid
                container
                key={product._id}
                component={Paper}
                className={classes.container_item}
              >
                <Grid item xs={12} md={3}>
                  <Typography variant="h6">{product.productName}</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    className={classes.field}
                    defaultValue={product.quantity_ordered}
                    onChange={(e) => handleSetNewItemQuantity(e, product)}
                    label="Quantity"
                    type="number"
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField
                    className={classes.field}
                    label="Unit Price"
                    variant="outlined"
                    size="small"
                    defaultValue={product.price}
                    disabled
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    type="number"
                    size="small"
                    label="Selling Price / Unit"
                    className={classes.field}
                    variant="outlined"
                    onChange={(e) => handleSetNewItemPrice(e, product)}
                    defaultValue={product.price}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="medium"
                    className={classes.field}
                    disableElevation
                    onClick={() => handleRemoveIitemSelected(product)}
                  >
                    Remove
                  </Button>
                </Grid>
              </Grid>
            ))}
            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="large"
              style={{ marginTop: 30 }}
            >
              create
            </Button>
          </>
        )}
      </form>
    </Container>
  )
}

export default Create
